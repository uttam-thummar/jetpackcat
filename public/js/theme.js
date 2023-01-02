jQuery(document).ready(function(){ 

    // stellernav activate for main menu
    jQuery('.stellarnav').stellarNav({
        theme: 'light',
        breakpoint: 650
    });

    jQuery(function(){
        createSticky(jQuery('.header'));
    });
    function createSticky(sticky) {
        if (typeof sticky !== "undefined") {
            var pos = sticky.offset().top,
                    win = jQuery(window);
            win.on("scroll", function() {
                if(win.scrollTop()==pos){
                    sticky.removeClass("fixed");                
                }else{
                win.scrollTop() >= pos ? sticky.addClass("fixed") : sticky.removeClass("fixed");      
                }
            });         
        }
    }

    /*jQuery('.menu-toggle').click(function(){
        if(jQuery('#header').hasClass('active')){
            jQuery('#header').removeClass('active');
        }else{
            jQuery('#header').addClass('active');
        }
    })*/

    var swiper = new Swiper(".myteam", {
        slidesPerView: 4,
        spaceBetween: 40,
        loop: true,
        centeredSlides: true,
        breakpoints: {
            0: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 40,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 50,
            },
        },
      });

});