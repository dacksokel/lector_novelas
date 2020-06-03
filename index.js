// ==UserScript==
// @name         Lectura de Novelas Ligeras
// @namespace    http://tampermonkey.net/
// @version      4.1
// @description  lee las novelas ligeras para mi
// @author       dacksokel
// @match        https://www.skynovels.net/xian-ni/*
// @match        http://www.skynovels.net/xian-ni/*
// @match        https://www.skynovels.net/against-the-gods/*
// @match        http://www.skynovels.net/heavenly-jewel-change/*
// @match        https://www.skynovels.net/martial-god-asura/*
// @grant        none
// @require https://code.jquery.com/jquery-3.3.1.js
// @require http://code.responsivevoice.org/responsivevoice.js
// ==/UserScript==

/*
Modificaciones de la Version 4.1

* se agregan un selector de idiomas

*/

/*esta es la caja del control*/
function f_caja_box(){
    var caja_box = document.createElement("div");
    var t = document.createTextNode("Controles aqui");
    caja_box.appendChild(t);
    caja_box.setAttribute("id", "caja_box_controles");
    document.body.appendChild(caja_box);
    $('#caja_box_controles').css(
        {
            'position':'fixed',
            'right':'-18%',
            'top':'25%',
            'background':'#ccc',
            'z-index':'10',
            'width':'18%',
            'text-align':'center',
            'border-radius':'0.5em',
            'font-size':'25px',
            'font-weight':'bold',

        }
    );
}

$(document).ready(function() {
    'use strict';
    f_caja_box();
    console.clear();//para limpiar la consola del navegador
    speechSynthesis.cancel();
    var segunda_voz = new SpeechSynthesisUtterance();//objeto de la voz 2
    var datos_texto=$('div#contentDiv p'); // textos para lectura
    var datos_texto2=$('div#contentDiv p'); // titulo de la lectura 1
    var datos_botones_siguiente_cap=$('div.nav-next a');
    var texto_cap=datos_texto2['0'].outerText;// titulo de la lectura 2
    var scroll_m=180;//controla la velocidad de bajada en el scroll
    var ini=0;//variable que controla la  lectura
    var rate_voz = 1.5;
    /*para poner pausas y agregar botones a las web desde aqui*/
    var v_pausa=false;
    /** Configuracion de velocidad de scroll */
    let velocidad_scroll;
    let idioma;
    /* Seleccion de idioma para la lectura*/
    if(localStorage.getItem("idioma_lectura") == null){
        idioma = 0;
    }else{
        idioma = parseInt(localStorage.getItem("idioma_lectura"));
    }
    /* determina la velocidad de lectura si no existe un valor guardado */
    if(localStorage.getItem("velocidad_scroll") == null){
        velocidad_scroll = 3.5//esta es la velocidad de control a la que baja el scroll
        localStorage.setItem("velocidad_scroll", velocidad_scroll)
    }else{
        velocidad_scroll = parseFloat(localStorage.getItem("velocidad_scroll"))//esta es la velocidad de control a la que baja el scroll
    }
    console.log(velocidad_scroll);
    /* fin de  la configuracion */
    //velocidad_scroll = parseFloat(velocidad_scroll);
    function f_pausa(){
        console.log("pulsado pausa");
        v_pausa=true;
        $('#pausa_scroll').text("reactivar Scroll");
        $('#pausa_lectura').css("background","red");
        $('#reanudar_lectura').css("background","gray");
        speechSynthesis.pause();//voz 2 nativo
    }
    function f_reanudar(){
        //console.clear();
        console.log("reanudando lectura");
        speechSynthesis.resume();
        v_pausa=false;
        $('#pausa_scroll').text("Pausa Scroll");
        $('#pausa_lectura').css("background","gray");
        $('#reanudar_lectura').css("background","red");
    }

    var botones_velocidad_voz = `
<center><p>VELOCIDAD DE VOZ</p></center>

<div class="cajas_divs_mios" id="caja_velocidad_voz">
<button id="aumentar_velocidad_voz" class="botones_scroll">Voz Velocidad +</button>
<button id="disminuir_velocidad_voz" class="botones_scroll">Voz Velocidad -</button>
</div>`;

    var botones_lectura = `
<center>
<p>LECTURA</p>
</center>

<div class="cajas_divs_mios">
<button id="adelantar_texto" class="botones_scroll">Adelantar Lectura</button>
<button id="retrasar_texto" class="botones_scroll">Retroceder Lectura</button>
</div>`;

    let opciones = '';
    $.each(speechSynthesis.getVoices(),(index,elementos)=>{
        opciones += `<option value="${index}">${elementos.name}</option>`;
    });
    const select_idioma = `
<p>Idiomas</p>
<select name="select" id="select_idioma">
${opciones}
</select>
<button id="btn_idioma" class="botones_scroll">Seleccionar Idioma</button>
`;

    var botones_scroll_html=`
<button id="escoder"><</button>
<div class="cajas_divs_mios" id="caja_scroll">
<center>
<p>SCROLL</p>
</center>
<button class="botones_scroll" id="pausa_scroll">Pausa Scroll</button>
<button class="botones_scroll" id="aumentar_v_s">Aumentar</button>
<button class="botones_scroll" id="disminuir_v_s">Disminuir</button>
${botones_velocidad_voz}
${botones_lectura}
${select_idioma}
<p>La Velocidad del Scroll es=<span id="salida_scroll">0</span></p>
<p>Posicion del Scroll es=<span id="salida_scroll2">0</span></p>
<p>Velocidad de la Voz <1 - 10>=<span id="rate_voz">0</span></p>
</div>
<p>
VERSION 4.1
</p>
`;


    $('#caja_box_controles').html(
        `
<p>${datos_texto[0].innerHTML}</p>
<button class="botones_lectura" id="pausa_lectura">Pausa</button>
<button class="botones_lectura" id="reanudar_lectura">Reanudar</button>
${botones_scroll_html}
`);
    /*css para el boton esconder y su funcion*/
    $('#escoder').css({
        "position":"absolute",
        "right":"100%",
        "border-radius":"50em"
    });
    $("#escoder").click(()=>{
        if($("#escoder").text() == ">"){
            $("#escoder").text("<")
            $('#caja_box_controles').css(
                {
                    'right':'-18%',
                }
            );
        }else{
            $("#escoder").text(">")
            $('#caja_box_controles').css(
                {
                    'right':'0%',
                }
            );
        }

    });
    $('.botones_lectura').css({
        "position":"relative",
        "z-index":"3",
        "display":"inline-block",
        "width":"45%",
        "height":"50px",
        "border":"solid thin #000",
        "background":"gray",
        "font-size":"12px",
        "color":"black"
    });
    $("#caja_scroll .cajas_divs_mios").css(
        {
            "display":"block",
            "width":"99%",
            "position":"relative",
            "font-size":"12px",
            "z-index":"3"
        }
    );
    $("#caja_scroll p").css(
        {
            "font-size":"9px",
            "margin":"0",
            "padding":"0"
        }
    );
    $('.botones_scroll').css(
        {
            "display":"inline-block",
            "vertical-aling":"top",
            "width":"45%",
            "font-size":"12px",
            "color":"black"
        }
    );
    $('#pausa_lectura').click(f_pausa);
    $('#reanudar_lectura').click(f_reanudar);
    $('#pausa_scroll').click(
        function(){
            if(!v_pausa){
                v_pausa=true;
                $('#pausa_scroll').text("reactivar Scroll");
            }else{
                v_pausa=false;
                $('#pausa_scroll').text("Pausa Scroll");
            }});
    $('#aumentar_v_s').click(
        function(){
            velocidad_scroll=velocidad_scroll+0.2;
        });
    $('#disminuir_v_s').click(
        function(){
            velocidad_scroll=velocidad_scroll-0.2 ;
        });
    /*funciones de control de lectura*/
    $('#adelantar_texto').click(
        function(){
            speechSynthesis.cancel();
            scroll_m = scroll_m+100;
        });
    $('#retrasar_texto').click(
        function(){
            ini = ini-2;
            speechSynthesis.cancel();
            scroll_m = scroll_m-75;
        });
    /*control de velocidad de voz*/
    $('#aumentar_velocidad_voz').click(
        function(){
            rate_voz = rate_voz+0.5;
            ini--;
            speechSynthesis.cancel();
            $('#rate_voz').text(rate_voz);
        }
    );
    $('#disminuir_velocidad_voz').click(
        function(){
            rate_voz = rate_voz-0.5;
            ini--;
            speechSynthesis.cancel();
            $('#rate_voz').text(rate_voz);
        }
    );

    $('#btn_idioma').click(
        function(){
            console.log("click to selecto idioma");
            let option = document.querySelector("#select_idioma").value;
            localStorage.setItem("idioma_lectura",option);
            location.reload();
            //console.log(option);
        }
    );
    /*hasta aqui el area de los botondes de control */
    /**nuevo linterna mientras habla**/
    $(document).scrollTop(10);
    $('#switch_noche').click();
    var validador_lectura2=setInterval(
        function(){
            //console.log("esta hablando? "+speechSynthesis.speaking+" el valor de ini es : "+ini +" y el valor de datos texto es: "+datos_texto.length);
            //console.log("");
            if(!speechSynthesis.speaking && (datos_texto.length > ini)){
                console.clear();
                if(ini!=0){

                    if($('#switch_noche').prop('checked')){
                        datos_texto[ini-1].style.color = "white";
                    }else{
                        datos_texto[ini-1].style.color = "black";
                    }
                    if(!$('#switch_noche').prop('checked')){
                        datos_texto[ini].style.color = "blue";
                    }else{
                        datos_texto[ini].style.color = "orange";
                    }
                    datos_texto[ini-1].style.fontSize  = "16px";
                    datos_texto[ini].style.fontSize  = "20px";
                }
                /*voz nativa de la pc*/
                console.log("en este arreglo se muestran las voces disponibles del speechSynthesis")
                $.each(speechSynthesis.getVoices(),(index,elementos)=>{
                    console.log(index)
                    console.log(elementos)
                })
                segunda_voz.rate = rate_voz; //esta es la velocidad de la voz va del 0.1 al 10
                segunda_voz.text=datos_texto[ini].innerText;
                segunda_voz.voice=speechSynthesis.getVoices()[idioma];//voz 2  español usa voz por defecto de pc es la 0
                speechSynthesis.speak(segunda_voz);
                /*voz usando la api de responsiveSpeech*/
                //responsiveVoice.speak(datos_texto[ini].innerText, "Spanish Latin American Female",{rate:rate_voz});
                console.log(datos_texto[ini].innerText);
                /*voces.forEach(function (elementos,index,voice) {
                    console.log('Nombre de la Voz es: '+elementos.name+" esta en la posicion "+index);
                });*/
                //speechSynthesis.cancel();
                ini++;
            }else if(datos_texto.length == ini){
                var siguiente_cap=datos_botones_siguiente_cap['0'].href;
                if(!speechSynthesis.speaking){
                    clearInterval(validador_lectura2);
                    segunda_voz.text="Siguiente Capitulo en unos Segundos";
                    speechSynthesis.speak(segunda_voz);
                    setTimeout(
                        function(){
                            location.href=siguiente_cap;
                        },5400);
                    $('#reanudar_lectura').css("background","gray");
                }
            }else{
                //console.log("el scroll se esta moviendo por "+scroll_m+" y el validador es: "+validador+" esta en pausa la segunda voz?<<<"+speechSynthesis.paused);
                if(!v_pausa){
                    $('#reanudar_lectura').css("background","red");
                    scroll_m+=velocidad_scroll;
                    localStorage.setItem("velocidad_scroll", velocidad_scroll);
                    $(document).scrollTop(scroll_m);
                    $('#salida_scroll').text(velocidad_scroll);
                    $('#salida_scroll2').text(scroll_m);
                    $('#rate_voz').text(rate_voz);
                }
            }
        },500);
    /**segunda_voz.text=texto_cap;//capturando texto para voz 2
    speechSynthesis.speak(segunda_voz);//ejecutando voz 2 nativo*/
});