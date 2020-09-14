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
var seriesFilter = "";
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

    var data = {"OkPercent": 73.87902233163355, "KoPercent": 26.12097766836645};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.23404255319148937, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.057, 500, 1500, "Course Selection"], "isController": false}, {"data": [0.6400778210116731, 500, 1500, "Course Selection-0"], "isController": false}, {"data": [0.10088938299055031, 500, 1500, "Course Selection-1"], "isController": false}, {"data": [0.050052966101694914, 500, 1500, "Landing page-1"], "isController": false}, {"data": [0.00575, 500, 1500, "Landing page"], "isController": false}, {"data": [0.5873940677966102, 500, 1500, "Landing page-0"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 11374, 2971, 26.12097766836645, 5581.160453666292, 0, 77283, 1451.0, 17066.0, 20108.5, 36196.0, 110.27087817268726, 1582.6028854881672, 14.079235228462567], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["Course Selection", 2000, 704, 35.2, 4835.953999999995, 0, 45130, 2008.5, 13128.2, 18789.85, 25464.77, 19.916747993387638, 439.836366799279, 3.7021519579408073], "isController": false}, {"data": ["Course Selection-0", 1799, 0, 0.0, 654.8443579766529, 255, 5717, 566.0, 1247.0, 1601.0, 2854.0, 18.672672922029395, 7.804593760379474, 2.2429089545015777], "isController": false}, {"data": ["Course Selection-1", 1799, 503, 27.959977765425236, 4461.577543079487, 0, 44568, 1831.0, 12190.0, 17331.0, 25248.0, 18.617021276595743, 444.90378324791476, 1.6109764363771835], "isController": false}, {"data": ["Landing page-1", 1888, 826, 43.75, 10990.25423728815, 0, 76419, 10377.0, 20843.0, 29774.249999999993, 45820.00999999992, 18.643599162618003, 362.9722000039499, 1.2596718916637042], "isController": false}, {"data": ["Landing page", 2000, 938, 46.9, 11204.34250000003, 0, 77283, 8902.5, 21121.4, 30033.199999999993, 46758.79, 19.60496005489389, 370.3495273366662, 3.4734666776944567], "isController": false}, {"data": ["Landing page-0", 1888, 0, 0.0, 765.6159957627111, 258, 10779, 817.0, 1053.1000000000001, 1164.55, 1437.489999999994, 18.835736020352172, 7.872749039756572, 2.262495635257146], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: javax.net.ssl.SSLException\/Non HTTP response message: Software caused connection abort: recv failed", 8, 0.26926960619320095, 0.0703358537014243], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException\/Non HTTP response message: Connect to www.firstbench.app:80 [www.firstbench.app\\\/3.22.164.210] failed: Connection timed out: connect", 32, 1.0770784247728038, 0.2813434148056972], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: www.firstbench.app:80 failed to respond", 281, 9.458094917536183, 2.4705468612625285], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: www.firstbench.app:443 failed to respond", 1310, 44.09289801413665, 11.51749604360823], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException\/Non HTTP response message: Connect to www.firstbench.app:443 [www.firstbench.app\\\/3.22.164.210] failed: Connection timed out: connect", 6, 0.2019522046449007, 0.052751890276068227], "isController": false}, {"data": ["Non HTTP response code: javax.net.ssl.SSLException\/Non HTTP response message: Connection reset", 78, 2.625378660383709, 0.6857745735888869], "isController": false}, {"data": ["Non HTTP response code: javax.net.ssl.SSLHandshakeException\/Non HTTP response message: Remote host terminated the handshake", 1256, 42.27532817233255, 11.042729031123615], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 11374, 2971, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: www.firstbench.app:443 failed to respond", 1310, "Non HTTP response code: javax.net.ssl.SSLHandshakeException\/Non HTTP response message: Remote host terminated the handshake", 1256, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: www.firstbench.app:80 failed to respond", 281, "Non HTTP response code: javax.net.ssl.SSLException\/Non HTTP response message: Connection reset", 78, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException\/Non HTTP response message: Connect to www.firstbench.app:80 [www.firstbench.app\\\/3.22.164.210] failed: Connection timed out: connect", 32], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Course Selection", 2000, 704, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: www.firstbench.app:443 failed to respond", 475, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: www.firstbench.app:80 failed to respond", 179, "Non HTTP response code: javax.net.ssl.SSLException\/Non HTTP response message: Connection reset", 25, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException\/Non HTTP response message: Connect to www.firstbench.app:80 [www.firstbench.app\\\/3.22.164.210] failed: Connection timed out: connect", 22, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException\/Non HTTP response message: Connect to www.firstbench.app:443 [www.firstbench.app\\\/3.22.164.210] failed: Connection timed out: connect", 2], "isController": false}, {"data": [], "isController": false}, {"data": ["Course Selection-1", 1799, 503, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: www.firstbench.app:443 failed to respond", 475, "Non HTTP response code: javax.net.ssl.SSLException\/Non HTTP response message: Connection reset", 25, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException\/Non HTTP response message: Connect to www.firstbench.app:443 [www.firstbench.app\\\/3.22.164.210] failed: Connection timed out: connect", 2, "Non HTTP response code: javax.net.ssl.SSLException\/Non HTTP response message: Software caused connection abort: recv failed", 1, null, null], "isController": false}, {"data": ["Landing page-1", 1888, 826, "Non HTTP response code: javax.net.ssl.SSLHandshakeException\/Non HTTP response message: Remote host terminated the handshake", 628, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: www.firstbench.app:443 failed to respond", 180, "Non HTTP response code: javax.net.ssl.SSLException\/Non HTTP response message: Connection reset", 14, "Non HTTP response code: javax.net.ssl.SSLException\/Non HTTP response message: Software caused connection abort: recv failed", 3, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException\/Non HTTP response message: Connect to www.firstbench.app:443 [www.firstbench.app\\\/3.22.164.210] failed: Connection timed out: connect", 1], "isController": false}, {"data": ["Landing page", 2000, 938, "Non HTTP response code: javax.net.ssl.SSLHandshakeException\/Non HTTP response message: Remote host terminated the handshake", 628, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: www.firstbench.app:443 failed to respond", 180, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: www.firstbench.app:80 failed to respond", 102, "Non HTTP response code: javax.net.ssl.SSLException\/Non HTTP response message: Connection reset", 14, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException\/Non HTTP response message: Connect to www.firstbench.app:80 [www.firstbench.app\\\/3.22.164.210] failed: Connection timed out: connect", 10], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
