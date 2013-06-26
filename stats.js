var categories = [
    'Points Played',
    'Points Won',
    'Points Lost',
    'Posessions played',
    'Offensive Posessions',
    'Defensive Posessions',
    'Scores per 100 Points',
    'Assists per 100 Points',
    'Ds per 100 Posessions',
    'Completed throws per 100 Posessions',
    'Catches per 100 Posessions',
    'Turnover Percentage',
    'Assist Percentage',
    'Assist to Turnover Ratio',
    'Score Percentage',
    'Drop Percentage',
    'Complete Throws',
    'Catches',
    'Turnovers',
    'Drops',
    'Assists',
    'Scores',
    'Ds',
    'Involvements',
    'Throws to dropper',
    'Disc Pickups'
];

var category_index = 0;
var category_text = 'Points Won';
var old_sorting_value = 'none';
var sorting_value = 'none';
var num_ticks = 10;

var selectedPlayers = [];

var valueLabelWidth = 40; // space reserved for value labels (right)
var barHeight = 20; // height of one bar
var barLabelWidth = 130; // space reserved for bar labels
var barLabelPadding = 5; // padding between bar and bar labels (left)
var gridLabelHeight = 18; // space reserved for gridline labels
var gridChartOffset = 3; // space between start of grid and first bar
var maxBarWidth = 600; // width of the bar with the max value

// accessor functions
var barLabel = function (d) { return d.Name; };
var barValue = function (d) { return parseFloat(d[categories[category_index]]); };

function renderChart(category_index) {
    var data = d3.csv.parse(d3.select('#csv').text()),
        sortedData,
        yScale,
        y,
        yText,
        x,
        chart,
        gridContainer,
        labelsContainer,
        barsContainer;

    $("#chart_title").text(categories[category_index]);

    // sorting
    sortedData = data.sort(function (a, b) {
        if (sorting_value === 'ascending') {
            return d3.ascending(barValue(a), barValue(b));
        } else if (sorting_value === 'descending') {
            return d3.descending(barValue(a), barValue(b));
        } else {
            return data;
        }
    });

    // scales
    yScale = d3.scale.ordinal().domain(
        d3.range(0, sortedData.length)
    ).rangeBands([0, sortedData.length * barHeight]);
    y = function (d, i) { return yScale(i); };
    yText = function (d, i) { return y(d, i) + yScale.rangeBand() / 2; };
    x = d3.scale.linear().domain(
        [0, d3.max(sortedData, barValue)]
    ).range([0, maxBarWidth]);

    // svg container element
    chart = d3.select('#chart').append("svg")
      .attr('width', maxBarWidth + barLabelWidth + valueLabelWidth)
      .attr('height', gridLabelHeight + gridChartOffset + sortedData.length * barHeight);

    // grid line labels
    gridContainer = chart.append('g').attr(
        'transform',
        'translate(' + barLabelWidth + ',' + gridLabelHeight + ')'
    );
    gridContainer.selectAll("text").data(x.ticks(num_ticks)).enter().append("text")
      .attr("class", "grid-line-labels")
      .attr("x", x)
      .attr("dy", -3)
      .attr("text-anchor", "middle")
      .text(String);

    // vertical grid lines
    gridContainer.selectAll("line").data(x.ticks(num_ticks)).enter().append("line")
      .attr("x1", x)
      .attr("x2", x)
      .attr("y1", 0)
      .attr("y2", yScale.rangeExtent()[1] + gridChartOffset)
      .style("stroke", "#ccc");

    // bar labels
    labelsContainer = chart.append('g').attr(
        'transform',
        'translate(' + (barLabelWidth - barLabelPadding) + ',' + (gridLabelHeight + gridChartOffset) + ')'
    );
    labelsContainer.selectAll('text').data(sortedData).enter().append('text')
        .attr("class", "bar-names")
        .attr("id", function (d, i) { return "bar-name-" + i; })
        .attr('y', yText)
        .attr('stroke', 'none')
        .attr('fill', 'black')
        .attr("dy", ".35em") // vertical-align: middle
        .attr('text-anchor', 'end')
        .on("mouseover", function () {
            d3.select(this).style("fill", "darkgray");
        })
        .on("mouseout", function () {
            if ($.inArray(d3.select(this).text(), selectedPlayers) === -1) {
                d3.select(this).style("fill", "black");
            }
        })
        .on("click", function () {
            selectedPlayers.push(d3.select(this).text());
            d3.select(this).style('fill', 'darkgray');
        })
        .text(barLabel);

    // bars
    barsContainer = chart.append('g')
        .attr(
            'transform',
            'translate(' + barLabelWidth + ',' + (gridLabelHeight + gridChartOffset) + ')'
        );
    barsContainer.selectAll("rect")
        .data(sortedData)
        .enter()
        .append("rect")
        .attr("class", "bars")
        .attr("id", function (d, i) { return "bar-" + i; })
        .attr('y', y)
        .attr('height', yScale.rangeBand())
        .attr('width', function (d) { return x(barValue(d)); })
        .attr('stroke', 'white')
        .attr('fill', 'steelblue')
        .on("mouseover", function () {
            d3.select(this).style("fill", "darkgray");
        })
        .on("mouseout", function () {
            d3.select(this).style("fill", "steelblue");
        });

    // bar value labels
    barsContainer.selectAll("text").data(sortedData).enter().append("text")
        .attr("class", "bar-value-labels")
        .attr("x", function (d) { return x(barValue(d)); })
        .attr("y", yText)
        .attr("dx", 3) // padding-left
        .attr("dy", ".35em") // vertical-align: middle
        .attr("text-anchor", "start") // text-align: right
        .attr("fill", "black")
        .attr("stroke", "none")
        .text(function (d) { return d3.round(barValue(d), 2); });

    // start line
    barsContainer.append("line")
        .attr("y1", -gridChartOffset)
        .attr("y2", yScale.rangeExtent()[1] + gridChartOffset)
        .style("stroke", "#000");

}

function redraw() {
    var chart = d3.select('#chart'),
        data = d3.csv.parse(d3.select('#csv').text()),
        sortedData,
        yScale,
        y,
        yText,
        x,
        gridLineLabels,
        labels,
        rect,
        barValueLabels;

    $("#chart_title").text(categories[category_index]);

    // sorting
    sortedData = data.sort(function (a, b) {
        if (sorting_value === 'ascending') {
            return d3.ascending(barValue(a), barValue(b));
        } else if (sorting_value === 'descending') {
            return d3.descending(barValue(a), barValue(b));
        } else {
            return data;
        }
    });

    yScale = d3.scale.ordinal().domain(d3.range(0, sortedData.length)).rangeBands([0, sortedData.length * barHeight]);
    y = function (d, i) { return yScale(i); };
    yText = function (d, i) { return y(d, i) + yScale.rangeBand() / 2; };
    x = d3.scale.linear().domain([0, d3.max(sortedData, barValue)]).range([0, maxBarWidth]);

    gridLineLabels = chart.selectAll(".grid-line-labels")
        .data(x.ticks(num_ticks))
        .attr("opacity", ".5")
        .transition()
        .duration(500)
        .attr("opacity", "0.25")
        .text(String);

    labels = chart.selectAll('.bar-names')
        .data(sortedData)
        .attr("opacity", "1")
        .transition()
        .duration(500)
        .attr("opacity", "0")
        .transition()
        .delay(500)
        .duration(500)
        .attr("opacity", "1")
        .text(barLabel);

    rect = chart.selectAll(".bars")
        .data(sortedData)
        .attr('fill', 'steelblue')
        .transition()
        .duration(1000)
        .attr('width', function (d) { return x(barValue(d)); });

    barValueLabels = chart.selectAll(".bar-value-labels")
        .data(sortedData)
        .transition()
        .duration(1000)
        .attr("x", function (d) { return x(barValue(d)); })
        .text(function (d) { return d3.round(barValue(d), 2); });

}
/*
function updateColors()
{

  var selectedIndeces = [];
  $('[id^="bar-name-"]').each(function () {
      if ($.inArray($(this).text(), selectedPlayers) > -1)
      {
          //add selected index to new variable
          selectedIndeces.push($(this).attr("id").substr($(this).attr("id").length - 1));
          $(this).attr("color", "darkgray");
      }
      else
      {
          $(this).attr("color", "black");
      }
  });
console.log(selectedPlayers + " " + selectedIndeces);
  for (var i = 0; i < selectedIndeces.length; i++)
  {
    $("#bar-" + selectedIndeces[i]).attr("fill", "darkgray");
  }

}
*/

//Function to fix the ticks not being correct (need to figure out the accessor function for my data)
function getTickValues(data, numValues, accessor) {
    var interval,
        residual,
        tickIndices,
        last,
        i;

    if (numValues <= 0) {
        tickIndices = [];
    } else if (numValues === 1) {
        tickIndices = [ Math.floor(numValues / 2) ];
    } else {
        // We have at least 2 ticks to display.
        // Calculate the rough interval between ticks.
        interval = Math.floor(data.length / (numValues - 1));

        // If it's not perfect, record it in the residual.
        residual = Math.floor(data.length % (numValues - 1));

        // Always label our first datapoint.
        tickIndices = [0];

        // Set stop point on the interior ticks.
        last = data.length - interval;

        // Figure out the interior ticks, gently drift to accommodate
        // the residual.
        for (i = interval; i < last; i += interval) {
            if (residual > 0) {
                i += 1;
                residual -= 1;
            }
            tickIndices.push(i);
        }
        // Always graph the last tick.
        tickIndices.push(data.length - 1);
    }

    if (accessor) {
        return tickIndices.map(function (d) { return accessor(d); });
    }

    return tickIndices.map(function (i) { return data[i]; });
}

// Event Handlers
$("input:radio[name=category]").click(function () {
    category_index = $(this).val();
    category_text = categories[category_index];
    redraw();
});

$("input:radio[name=sorting]").click(function () {
    old_sorting_value = sorting_value;
    sorting_value = $(this).val();
    redraw();
});

$("#chart").click(function () {
	if (category_index >= 11) {
        category_index = 0;
    }
});


