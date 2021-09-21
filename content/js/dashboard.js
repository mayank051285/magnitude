/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "^(Address|SignIn|Test|addToCart|deleteOneItem|delivery|next|orderConfirm|paymentOption|proceedToCheckOut|shoppingSite)(-success|-failure)?$";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 96.66666666666667, "KoPercent": 3.3333333333333335};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.00625, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "next"], "isController": false}, {"data": [0.0, 500, 1500, "delivery"], "isController": false}, {"data": [0.0, 500, 1500, "Address"], "isController": false}, {"data": [0.0, 500, 1500, "Test"], "isController": true}, {"data": [0.0, 500, 1500, "shoppingSite"], "isController": false}, {"data": [0.0, 500, 1500, "deleteOneItem"], "isController": false}, {"data": [0.0, 500, 1500, "SignIn"], "isController": false}, {"data": [0.0, 500, 1500, "paymentOption"], "isController": false}, {"data": [0.016666666666666666, 500, 1500, "addToCart"], "isController": false}, {"data": [0.0, 500, 1500, "proceedToCheckOut"], "isController": false}, {"data": [0.0, 500, 1500, "orderConfirm"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 150, 5, 3.3333333333333335, 7580.380000000003, 13, 16222, 7600.5, 13527.7, 15046.899999999998, 16173.04, 1.1962867260024883, 141.64043403027003, 33.71362634133649], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["next", 10, 0, 0.0, 13152.500000000002, 10347, 15875, 13273.5, 15800.0, 15875.0, 15875.0, 0.303425675880693, 27.30436985124556, 13.572017135965044], "isController": false}, {"data": ["delivery", 10, 0, 0.0, 8933.800000000001, 7470, 10954, 8742.0, 10889.0, 10954.0, 10954.0, 0.37441964954320806, 21.569277580687437, 23.03576672953797], "isController": false}, {"data": ["Address", 10, 0, 0.0, 8623.1, 7068, 10250, 8350.0, 10215.5, 10250.0, 10250.0, 0.3948667324777887, 21.927828849950643, 24.43804756910168], "isController": false}, {"data": ["Test", 10, 4, 40.0, 113705.7, 98333, 118076, 115055.5, 118069.9, 118076.0, 118076.0, 0.07970286770918017, 141.55237866981892, 33.692667174274305], "isController": true}, {"data": ["shoppingSite", 10, 0, 0.0, 8586.2, 8101, 9504, 8430.5, 9451.3, 9504.0, 9504.0, 0.5778676683039584, 744.8688285538861, 27.79927224790523], "isController": false}, {"data": ["deleteOneItem", 10, 1, 10.0, 3840.1000000000004, 13, 5486, 4229.0, 5437.900000000001, 5486.0, 5486.0, 0.45275501426178294, 4.360817802893105, 0.334879538869018], "isController": false}, {"data": ["SignIn", 10, 0, 0.0, 14167.0, 11919, 15516, 14238.0, 15501.6, 15516.0, 15516.0, 0.30885168941874114, 18.901572585937984, 18.445594085876213], "isController": false}, {"data": ["paymentOption", 10, 2, 20.0, 8218.699999999999, 197, 10811, 8640.5, 10796.3, 10811.0, 10811.0, 0.37550223423829376, 16.73185150764147, 18.217285541286472], "isController": false}, {"data": ["addToCart", 60, 0, 0.0, 4438.1833333333325, 1435, 6445, 4571.0, 5932.0, 6245.25, 6445.0, 1.5228426395939085, 3.02089942893401, 1.160572652284264], "isController": false}, {"data": ["proceedToCheckOut", 10, 0, 0.0, 10076.0, 8508, 11057, 9972.0, 11034.8, 11057.0, 11057.0, 0.35134565385426186, 41.34233528476565, 15.729820407473122], "isController": false}, {"data": ["orderConfirm", 10, 2, 20.0, 11479.200000000003, 431, 16222, 12295.5, 16212.4, 16222.0, 16222.0, 0.3518029903254178, 13.691595206684257, 16.942509069920845], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: automationpractice.com:80 failed to respond", 2, 40.0, 1.3333333333333333], "isController": false}, {"data": ["508/Loop Detected", 1, 20.0, 0.6666666666666666], "isController": false}, {"data": ["Assertion failed", 2, 40.0, 1.3333333333333333], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 150, 5, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: automationpractice.com:80 failed to respond", 2, "Assertion failed", 2, "508/Loop Detected", 1, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["deleteOneItem", 10, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: automationpractice.com:80 failed to respond", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["paymentOption", 10, 2, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: automationpractice.com:80 failed to respond", 1, "Assertion failed", 1, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["orderConfirm", 10, 2, "508/Loop Detected", 1, "Assertion failed", 1, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
