#!/usr/bin/node

var fs = require('fs');
var path = require('path');
var  URL = require('url-parse');
var request = require('request');
var cheerio = require('cheerio');
var sqlite = require('sqlite3').verbose();

var file = path.join(__dirname, '.lonjs');
var exists = fs.existsSync(file);
var statistics = "http://www2.defesasocial.rn.gov.br/estatistica/index.php";
var db = new sqlite.Database(file);

db.serialize(function() {
	if (!exists) {
		db.run("CREATE TABLE Obitos (entrada TEXT, obito TEXT, nome TEXT, sexo TEXT, idade INTEGER, local TEXT, origem TEXT, causa TEXT, municipio TEXT)");
	}
});

var today = new Date();
var ctrl = 0;
var stmt = db.prepare("INSERT INTO Obitos VALUES (?,?,?,?,?,?,?,?,?)");

/* date handle */
var flag = 0;
var day = today.getDate() - 1;
if (day  == 1) {
	flag = 1;
}

if (day < 10)
	day = "0"+day;

if (!flag)
	var month = (today.getMonth()+1);
else
	var month = (today.getMonth());

if (month < 10)
	month = "0"+month;

var date = day+'-'+month+'-'+today.getFullYear();

request(statistics, function(error, response, body) {
	if (error) {
		console.log("Error: " + error);
	}
	console.log("Status code: "+ response.statusCode);
	if (response.statusCode == 200) {
		var $ = cheerio.load(body);
		var content;

		/* vars to insert */
		var entrada;
		var obito;
		var nome;
		var sexo;
		var idade;
		var local;
		var origem;
		var causa;
		var municipio;

		$(".FormDE").find('tr').each(function() {
			content = $(this).text();
			var arrContent = content.trim().split('\n');


			entrada = arrContent[0].trim();
			obito = arrContent[2].trim();
			nome = arrContent[3].trim();
			sexo = arrContent[4].trim();
			idade = arrContent[5].trim();
			local = arrContent[6].trim();
			origem = arrContent[7].trim();
			causa = arrContent[8].trim();

			if (arrContent[9])
				municipio = arrContent[9].trim();
			else
				municipio = '';

			if (entrada != "Data/Entrada" && entrada == date) {
				stmt.run(entrada, obito, nome, sexo, idade, local, origem, causa, municipio);
			}

		});
	}
});

//stmt.finalize();
//db.close();
