// ==UserScript==
// @name           drnu
// @namespace      marlar
// @include        http://www.dr.dk/TV/se/*
// @include        http://www.dr.dk/tv/se/*
// @require        http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js
// ==/UserScript==

if(document.location.href.match(/http:\/\/drnu\.tumblr\.com/)) {
    alert("Du skal ikke klikke p� linket. Tr�k det op p� bogm�rkelinjen i din browser.");
    exit;
}

if(document.location.href.match(/www.dr.dk\/tv\/?$/i)) {
    alert("V�lg en udsendelse og klik derefter igen p� bogm�rket");
    exit;
}

if(!document.location.href.match(/www.dr.dk\/tv\/se/i)) {
    if(confirm("Scriptet virker kun p� DR TV.\n�nsker du at g� dertil?\n\nNB: du skal klikke p� bogm�rket igen n�r du kommer derhen :-)")) {
        document.location="http://www.dr.dk/tv";
    }
    //exit;
}

$("body").prepend($("<style>\
                    .bodymargin {margin-left:237px !important}\
                    .showcb { vertical-align: text-bottom; visibility: hidden}\
                    #showList p { margin-left:10px; padding:5px 10px; text-indent:-18px; color: white}\
                    #showList select { width: 96px; margin-bottom:5px; }\
                    #showList a { color:yellow }\
                    #makelist  a, #showList .bigbutton  a { font-size: 14px; color:lightblue; font-weight: bold; cursor: pointer; display: block; width:192px; padding:5px; border: 1px solid}\
                    #makelist, #showList .bigbutton, #showWait { margin: 10px 0; font-size: 14px; }\
                    #makelist { margin-top: 27px }\
                    #showoptions, .bigbutton, #showWait { display: none }\
                    #showWait { color: yellow }\
                    #showintro { padding: 2px }\
                    #resultlist { position: fixed; margin: 10%; z-index:99999 }\
                    #resultlist textarea {  border:6px solid silver; padding-top:20px; white-space: nowrap; overflow: auto; width: 100%; height: 100%}\
                    #showclose { right: 0; position:absolute; z-index: 100000; cursor: pointer; margin: -4px 4px 0 0; font-weight:bold; font-size:13px; color:lightblue !important}\
                    #resultlist a { right: 0; position:absolute; z-index: 100000; cursor: pointer; margin: 6px 7px 0 0; font-weight:bold; font-size:13px; color:red}\
                    #autoscan { margin: 5px 0 10px 0}\
                    .bold { font-weight: bold }\
                    .justifywidth { width: 112px; float:left}\
                    </style>"));
$("<img id='dllogo' title='Klik for at �bne programscanneren' src='http://i42.tinypic.com/2iqgymr.png' style='display:none;top:0;position:fixed;left:0;z-index:99999;margin:4px;cursor:pointer'>").prependTo("body").click(function(){
    $("body").toggleClass("bodymargin");
    $("#showList").show();
    $("#dllogo").hide();
    });
var showdata = new Array();
$("body").addClass("bodymargin");
$progDiv = $("<div id='showList'><a id='showclose' title='Luk'>[X]</a>\
             <div id='makelist' title='Scan programmer som kan optages'><a>Start programscanning</a></div>\
             <div class='bold autoscan' title='Scan automatisk n�r du skifter program\nBem�rk: kan g�re programskift tr�gt!'><input type='checkbox' id='autoscan'> Scan automatisk</div>\
             <div id='showoptions'>\
             <div title='V�lg hvilken kvalitet du foretr�kker.'><div class='justifywidth'>Kvalitet </div><select id='showQual'><option value='0'>Bedst</option><option value='1'>God</option><option value='2'>Mindre god</option><option value='3'>D�rligst</option></select></div>\
             <div title='V�lg det maksimale antal programmer som skal scannes for hver serie. Jo st�rre tal, jo langsommere kan browseren f�les.'><div class='justifywidth'>Max programmer </div><select id='maxprogs'><option selected>5</option><option>10</option><option>15</option><option>alle</option></select></div>\
             <div id='runbg' title='K�r optagkommandoerne i baggrunden (optag flere p� en gang).'><input type='checkbox' id='bgmode'> K�r i baggrunden</div>\
             <div title='Quiet mode - vis ikke output undervejs'><input type='checkbox' id='quietmode'> Skjul output fra kommandoen</div>\
             </div>\
             <div class='bigbutton' id='browserdownload' title='Download film direkte i browseren'><a>Hent via browser</a></div>\
             <div class='bigbutton' id='makecmdline' title='Gener�r kommandolinjer til at copy-paste ind i terminalen'><a>Gener�r kommandolinje</a></div>\
             <h2 id='showWait'>Henter<br>programoversigt...</h2>\
             <div id='showintro'>Dette script genererer kommandolinjer til at optage udsendelser fra DR TV med programmet \
             <b>wget</b> som er standard i Linux, men f�s ogs� <a href='http://gnuwin32.sourceforge.net/packages/wget.htm'>til Windows</a>, eller direkte fra browseren. Sidstn�vnte er det letteste, men wget giver flere muligheder.<br><br>\
             1) Klik p� linket herover for at scanne programmer der kan optages.<br><br>2) N�r oversigten er dannet, kan du v�lge den kvalitet som �nskes optages. Hvis en �nsket kvalitet ikke er til r�dighed, v�lges automatisk en anden.<br><br>\
             Du kan ogs� v�lge om output fra optageprogrammet skal undertrykkes (quiet) og om der skal optages i baggrunden (dvs. flere udsendelser p� en gang).<br><br>\
             3) V�lg tilsidst de programmer der skal optages og tryk p� 'Gener�r kommandolinje' eller 'Hent via browser'<br><br>\
             4) Klik dig evt. frem til andre programmer p� DR NU og klik p� 'Scan igen'<br><br>\
             <b>5) Respekt�r DRs ophavsret: Materialet m� ikke gengives uden tilladelse j�vnf�r lov om ophavsret.</b></div>\
            </div>")
    .prependTo("body")
    .css({
        padding: "5px 0 0 5px",
        border: "4px solid lightblue", 
        position: "fixed",
        top:0, left:0,
        zIndex:10000,
        backgroundColor:"#666666",
        fontSize: "14px",
        color:"white",
        width:"225px",
        height:"100%",
        overflow:"auto"
    });

$("#showclose").click(function(){
    $("body").toggleClass("bodymargin");
    $("#showList").hide();
    $("#dllogo").show();
})

if(document.cookie.match(/autoscan=1/)) {
    $("#autoscan").attr("checked","checked");
    scanprogs();
}

//$("#autoscan,#bgmode,#quietmode").click(function(){
$("#autoscan").click(function(){
    var cookieval=0;
    var cookiename = this.id;
    if($(this).is(":checked")) {
        cookieval=1;
        scanprogs();
    }
    var date = new Date();
    date.setDate(date.getDate() + 365)
    document.cookie = cookiename + "=" + cookieval + "; expires=" + date + "; path=/"
})

if(navigator.appVersion.indexOf("Win")!=-1) $("#runbg").hide();
$("<div id='resultlist' style='display:none'><a onclick='document.getElementById(\"resultlist\").style.display=\"none\"'>[X]</a><textarea wrap='off'></textarea></div>").prependTo("body");

$("#resultlist").keyup(function(e) {
  if (e.keyCode == 27) { $(this).hide() }   // esc
});

function getDRNUShows() {
    var serie = document.location.href.match(/http:\/\/www.dr.dk\/TV\/se\/([^\/]+)(\/([^\/]+))?\/?(#!.+)?$/i);
    if(!serie) return;
    var serieUrl = "http://www.dr.dk/nu/api/programseries/" + serie[1] + "/videos";

    $.ajaxSetup( { "async": false } );

    $("#showList p").remove();
    var maxprogs = $("#maxprogs").val();
    if(maxprogs=="alle") maxprogs=999;
    $.getJSON(serieUrl, function(data) {
        if(data.length) $.each(data, function(showId, show) {
            // Method 1
            if(showId < maxprogs) {
                $.getJSON(show.videoResourceUrl, function(resData) {
                    var html = "<p id='prog" + showId + "'><input class='showcb' type='checkbox'>&nbsp;<b>" + show.title + " (" + show.formattedBroadcastTime + ")</b><br>" + show.description + "</p>";
                    $progDiv.append(html);
                    var medialinks = new Array();
                    $.each(resData.links, function(resource, link) {
                        bitrate = link.bitrateKbps;
                        medialinks.push(bitrate + "::" + link.uri);
                        return true;
                    });
                    medialinks.sort(function(a,b){
                        return b.split(/::/)[0]-a.split(/::/)[0];
                    });
                    showdata["prog"+showId]= [medialinks, show.title + "-" + show.formattedBroadcastTime];
                    //console.log(showdata);
                });
            }
        })
        else {
            // Method 2
            var resourceUrl = $("script:contains('videoData')").text().match('resource: "(http://www.dr.dk/mu/bar/[^"]*)"')[1];
            $.getJSON(resourceUrl, function(data) {
                var showId = 0;
                //console.info(resourceUrl);
                //console.info(data);
                var showDate = data.publish.split("T")[0];
                var html = "<p id='prog" + showId + "'><input class='showcb' type='checkbox'>&nbsp;<b>" + data.postingTitle + " (" + showDate + ")</b><br>" + data.postingTeaser + "</p>";
                $progDiv.append(html);
                var medialinks = new Array();
                $.each(data.links, function(resource, link) {
                    bitrate = link.bitrateKbps;
                    medialinks.push(bitrate + "::" + link.uri);
                    return true;
                });
                //console.log("a");
                medialinks.sort(function(a,b){
                    return b.split(/::/)[0]-a.split(/::/)[0];
                });
                //console.log("b");
                showdata["prog"+showId]= [medialinks, data.postingTitle + "-" + showDate];
                //console.log(showdata);
            });
        }
    });
    $.ajaxSetup( { "async": true } );
}

$('#makelist').click(function(){
    scanprogs();
});

$('#makecmdline, #browserdownload').click(function(){
    if($("#showList input.showcb:checked").length==0) {
        alert("Du skal v�lge et eller flere programmer p� listen");
        return;
    }
    fixFlash();
    var buttonId = this.id;
    var width = $("body").width()-$("#showList").width();
    var height = $(window).height()*0.7;

    var bgmode = $("#bgmode").is(":checked") ? "b" : ""; 
    var quietmode = $("#quietmode").is(":checked") ? "q" : "";
    var dash = bgmode+quietmode!="" ? " -" : "";
    
    var cmdline = "";
    //console.log(showdata);
    $("#showList input.showcb:checked").parent().each(function(){
        var filename = showdata[this.id][1].replace(/[-, :\?\/]+/g,"-").replace(/\./g,"").replace(/-*_/,"_") + ".mp4";
        //console.log(filename);
        var show = showdata[this.id][0];
        var qual = document.getElementById("showQual").selectedIndex;
        if(qual>show.length-1) qual = show.length-1;
        var rtmpUrl = show[qual].split(/::/)[1];
        var mp4Url = rtmpUrl.replace(/rtmp:\/\/vod.dr.dk\/cms\/mp4:/, "http://vodfiles.dr.dk/");
        var filnavn = mp4Url.match(/([^\/\?]*\.mp4)/)[1];
        //console.log(filnavn);
        //console.log(mp4Url);
        cmdline = cmdline + "wget" + dash + bgmode + quietmode + " -O '" + filename + "' '" + mp4Url + "'\n";
        if(buttonId=="browserdownload") {
            if(confirm("Titel: " + showdata[this.id][1] + "\nFilnavn: " + filnavn + "\n\nN�r vinduet eller fanebladet med filmen vises, skal du trykke Ctrl-S for at gemme eller bruge menuen Filer > Gem. Derefter kan du lukke vinduet/fanebladet. Hvis du har sat kryds ved flere film, skal du bare v�lge de p�g�ldende vinduer/faneblade og trykke Ctrl-S.\n\nTip: Det kan v�re en god id� at omd�be filen n�r du gemmer da navnet ofte er intetsigende."))
                window.open(mp4Url);
        }
    });
    if(buttonId=="makecmdline") {
        $("#resultlist").width(width).height(height).show();
        $("#resultlist textarea").val(cmdline).focus(function(){this.select()}).focus();
    }
});

function scanprogs() {
    $("#showWait").show();
    $("#resultlist,#showoptions,#makecmdline,#browserdownload,#makelist,#showintro,.autoscan").hide();
    $("#makelist a").text("Scan igen");
    $(".showcb").css("visibility","hidden");
    getDRNUShows();
    $("#showWait").hide();
    $("#showoptions,#makecmdline,#browserdownload,#makelist,.autoscan").show();
    $(".showcb").css("visibility","visible");
}

var last_path = document.location.pathname;
var timeout_id;
start();

function start() {
  clearTimeout( timeout_id );
  var path = document.location.pathname;
  if ( path !== last_path ) {
  //console.log("last: " + last_path);
  //console.log("path: " + path);
    if($("#showList").is(":visible")  && $("#autoscan").is(":checked")) scanprogs();
    last_path = path;
  }
  timeout_id = setTimeout( start, 1000 );
};


function fixFlash() {
    $('object').each(function(){
        if($(this).find('param[name=wmode]').attr('value') != 'transparent') {
            $(this).prepend('<param name="wmode" value="transparent" />');
            $(this).parent().html($(this).parent().html());
        }
    });
}
// JScript File

