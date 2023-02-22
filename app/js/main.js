$(function () {
    $('.menu-btn').on(('click'), function () {
        $('.sidebar').toggleClass('active');
        $('.menu-btn__btn-line').toggleClass('active');
        $('body').toggleClass('no-scroll');
    });
})