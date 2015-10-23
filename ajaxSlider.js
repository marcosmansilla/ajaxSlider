/**
 *  Slider programado xra cargar mediante ajax a medida que se
 *  van mostrando las queries...
 * 
 * 
 *
 *  @param ajaxCmd: Se introduce la dirección de quien va procesar los sliders.
 *  @param options: Parametrización del Slider.
 *  Se usa arrWidth opcion para array de posibilidades de ancho:
 *       formato [{'width':500,'rows':2},{'width':1000,'rows':6,'itemWidth':666}]}
 * 
 * 
 * 
 *  @author Marcos Mansilla
 *  @version 2015
 * 
 */

(function($){
    $.fn.ajaxSlide = function(ajaxCmd,options){
       
        var settings = $.extend({
            'itemWidth':'180',
            'rows': 1,
            'easing': 'fast',
            'autoSlide': true,
            'debug': false,
            'autoSlideInterval': 5000,
            'touchslide': true,
        },options);
               
        var $refObj = $(this);
       
        if (settings.debug && console.log) {
            console.log("OBJ("+$refObj.attr('id')+") - build ajaxSlide");
            console.log("OBJ("+$refObj.attr('id')+") - params ["+jQuery.param(settings)+"]");
        }
       
        // arrancador
        loadStructure();
       
        var autoslide;
        function loop() {
            if (autoslide) clearTimeout(autoslide);
            if (settings.autoSlide == true) {
                autoslide = setTimeout(function() {
                    loadNextPage();
                }, settings.autoSlideInterval);
            }
        }
       
        // escuchadores
        $refObj.siblings('.pagination').on("click", "a.nextPage", function(e){
            if (settings.debug && console.log) console.log("OBJ("+$refObj.attr('id')+") - nextPage");
            e.preventDefault();
            if (autoslide) clearTimeout(autoslide);
            loadNextPage();
        });
       
        $refObj.siblings('.pagination').on("click", "a.prevPage", function(e){
            if (settings.debug && console.log) console.log("OBJ("+$refObj.attr('id')+") - prevPage");
            e.preventDefault();
            if (autoslide) clearTimeout(autoslide);
            loadPrevPage();
        });
       
        $refObj.mouseover(function(){
            if (autoslide) clearTimeout(autoslide);
        })
        .mouseleave(function(){
            if (settings.autoSlide == true) loop();
        });
       
        var timer;
        $(window).bind('resize', function() {
            timer && clearTimeout(timer);
            timer = setTimeout(loadStructure, 100);
        });
       
        var onChange, curpage, ready, items;
        onChange = false;
        curpage = -1;
        ready = -1;
        rowItems = -1;
       
        function loadStructure() {
            if (!onChange) {
                onChange = true;

                var $elementsqty = $refObj.width() / loadParams().iWidth;
                var items = Math.floor($elementsqty);
                if (settings.debug && console.log) console.log($elementsqty);
                if (ready == 1) {
                    if (rowItems == items) {
                        onChange = false;
                        return;
                    }
                    clearTimeout(autoslide);
                    $refObj.html("");
                }       
               
                $.get(ajaxCmd+"&items="+items+"&rows="+loadParams().rows, function(e){
                    $refObj.append(e);
                    var nextPageLoaded = $refObj.children('div.page1');
                    nextPageLoaded.hide();
                   
                    curpage = 1;
                    ready = 1;
                    rowItems = items;
                   
                    nextPageLoaded.fadeIn(settings.easing);
                    $refObj.siblings('.pagination').show();
                   
                    loop();
                });
                onChange = false;
            } else {
                if (settings.debug && console.log) console.log("OBJ("+$refObj.attr('id')+") - onchange!!!");
            }
        }
       
        function fadeEffects(fadingOut,fadingIn) {
            $refObj.siblings('.pagination').hide();
            fadingOut.fadeOut(settings.easing, function() {
                $refObj.children("div.paged").hide();
                fadingIn.fadeIn(settings.easing, function() {
                    $refObj.siblings('.pagination').show();                   
                    loop();                   
                });

            });
        }
       
       
        function loadParams() {
            var itemWidth = settings.itemWidth;
            var rows = settings.rows;
            var minWidth = 0;
           
            if (typeof settings.arrWidth != "undefined" && settings.arrWidth.length>0) {
                $.each(settings.arrWidth, function(i,n){
                    if ($($refObj).parent().width() < n.width && (minWidth==0 || minWidth > n.width )) {
                        minWidth = n.width;
                    }
                });
               
                $.each(settings.arrWidth, function(i,n){
                    if (n.width == minWidth) {
                        if (typeof n.rows!="undefined") rows = n.rows;
                        if (typeof n.itemWidth!="undefined") itemWidth = n.itemWidth;
                    }
                });
                if (settings.debug && console.log) {
                    console.log("OBJ("+$refObj.attr('id')+") - minwidth detected.."+minWidth);
                    console.log("OBJ("+$refObj.attr('id')+") - mi padre mide: "+$($refObj).parent().width());
                }
            }
            if (settings.debug && console.log) console.log("OBJ("+$refObj.attr('id')+") - devolvere: "+rows+" y el width de "+itemWidth);
            return {'rows':rows,'iWidth':itemWidth};
        }
       
        function loadNextPage() {
            $refObj.siblings('.pagination').hide();
            var currentPage = $refObj.children("div.page"+curpage);
           
            if (currentPage.data("page") == 1 && currentPage.hasClass("lastpage")) {
                if (autoslide) clearTimeout(autoslide);
                settings.autoSlide = false;
                return;
            }
            //subo contador
            curpage++;
           
            var nextPageLoaded;
            if (currentPage.hasClass("lastpage")) {
                nextPageLoaded = $refObj.children("div.page1");
                curpage = 1;
            } else nextPageLoaded = $refObj.children("div.page"+curpage);
           
            if (nextPageLoaded.length) {
                fadeEffects(currentPage,nextPageLoaded);
            } else {
                $.get(ajaxCmd+"&nextPage=true&items="+rowItems+"&rows="+loadParams().rows, function(e){
                    $refObj.append(e);
                    var nextPageLoaded = $refObj.children('div.page'+curpage);
                    nextPageLoaded.hide();
                   
                    fadeEffects(currentPage,nextPageLoaded);
                });
            }
        }
       
        function loadPrevPage() {
            $refObj.siblings('.pagination').hide();
            var currentPage = $refObj.children("div.page"+curpage);
           
            if (currentPage.data("page") == 1 && currentPage.hasClass("lastpage")) {
                if (autoslide) clearTimeout(autoslide);
                settings.autoSlide = false;
                return;
            }
            //subo contador
            curpage--;

            var prevPageLoaded;
            if (curpage == 0 && $refObj.children("div.lastpage").length) {
                prevPageLoaded = $refObj.children("div.lastpage");
                curpage = prevPageLoaded.data("page");
            } else {
                prevPageLoaded = $refObj.children("div.page"+curpage);
            }
           
            if (prevPageLoaded && prevPageLoaded.length) {
                fadeEffects(currentPage,prevPageLoaded);
            } else {
                $.get(ajaxCmd+"&prevPage=true&items="+rowItems+"&rows="+loadParams().rows, function(e){
                    $refObj.append(e);
                   
                    if (curpage == 0) {
                        prevPageLoaded = $refObj.children("div.lastpage");
                        curpage = prevPageLoaded.data("page");
                    } else {
                        prevPageLoaded = $refObj.children("div.page"+curpage);
                    }
                    prevPageLoaded.hide();
                    fadeEffects(currentPage,prevPageLoaded);
                });               
            }
        }
       
        if (settings.touchslide) {
            $refObj.touchwipe({
                wipeLeft: function() { loadPrevPage(); },
                wipeRight: function() { loadNextPage(); },
                min_move_x: 20,
                min_move_y: 20,
                preventDefaultEvents: false
           });
        }
       
    };
})(jQuery);