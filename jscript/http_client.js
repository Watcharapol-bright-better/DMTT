
// jrunscript -f file.js

var URI = Java.type('java.net.URI');
var Duration = Java.type("java.time.Duration");
var HttpClient = Java.type('java.net.http.HttpClient');
var HttpRequest = Java.type('java.net.http.HttpRequest');
var HttpResponse = Java.type('java.net.http.HttpResponse');
var BodyPublishers = Java.type("java.net.http.HttpRequest.BodyPublishers");

var client = HttpClient.newHttpClient();

var payload = JSON.stringify({
   "id": 999,
   "value": "content"
});

var accessTo = "https://examples.http-client.intellij.net/post";
var httpRequest = HttpRequest.newBuilder()
   .uri(URI.create(accessTo))
   .timeout(Duration.ofSeconds(30))
   .header("Content-Type", "application/json; charset=UTF-8")
   .header("Accept", "*/*")
   .POST(HttpRequest.BodyPublishers.ofString(payload))
   .build();

var response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());

print(response.body());
 