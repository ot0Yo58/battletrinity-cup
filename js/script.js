$(document).ready(function() {
    console.log('スクリプト開始');
    console.log('jQueryロード:', typeof jQuery);
    console.log('スライドショー要素:', $('.slideshow').length);
    console.log('home存在:', $('#home').length);

    // スライドショー（変更なし）
    var slideshowImages = [
        'images/summer1.jpg',
        'images/winter1.jpg',
        'images/summer2.jpg',
        'images/winter2.jpg'
    ];
    var currentImageIndex = 0;

    slideshowImages.forEach(function(img) {
        var image = new Image();
        image.src = img;
        image.onload = function() {
            console.log('画像ロード成功:', img);
        };
        image.onerror = function() {
            console.error('画像ロード失敗:', img);
        };
    });

    function updateSlideshow() {
        console.log('スライドショー更新:', slideshowImages[currentImageIndex]);
        $('.slideshow').animate({ opacity: 0 }, 2000, function() {
            currentImageIndex = (currentImageIndex + 1) % slideshowImages.length;
            $(this).css({
                'background-image': 'url("' + slideshowImages[currentImageIndex] + '")',
                'background-size': 'contain',
                'background-position': 'center',
                'background-repeat': 'no-repeat',
                'opacity': '1'
            }).animate({ opacity: 1 }, 2000, function() {
                setTimeout(updateSlideshow, 4000);
            });
        });
    }

    $('.slideshow').css({
        'background-image': 'url("' + slideshowImages[0] + '")',
        'background-size': 'contain',
        'background-position': 'center',
        'background-repeat': 'no-repeat',
        'opacity': '1'
    });
    setTimeout(updateSlideshow, 4000);

    // 動画停止関数（変更なし）
    function stopAllVideos() {
        console.log('すべての動画を停止');
        $('.video-container iframe').each(function() {
            var iframe = $(this);
            var parent = iframe.parent();
            var src = iframe.attr('data-src') || iframe.attr('src');
            if (src) {
                iframe.remove();
                parent.data('iframe-src', src);
                console.log('動画停止（削除）:', src);
            }
        });
    }

    // 動画復元関数（変更なし）
    function restoreVideos(sectionId) {
        console.log('動画復元:', sectionId);
        $(`#${sectionId} .video-container`).each(function() {
            var container = $(this);
            var src = container.data('iframe-src');
            if (src && container.find('iframe').length === 0) {
                var iframe = $('<iframe>', {
                    src: src,
                    class: 'youtube-video',
                    frameborder: '0',
                    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
                    allowfullscreen: true
                });
                container.append(iframe);
                console.log('動画復元:', src);
            }
        });
    }

    // セクション表示
    function showSection(sectionId) {
        console.log('showSection:', sectionId, '履歴数:', history.length);
        stopAllVideos();
        $('.section').css('display', 'none');
        $('.nav-link').removeClass('active');

        if (['summer1', 'winter1', 'summer2', 'winter2'].includes(sectionId)) {
            console.log('動画セクション:', sectionId);
            $('#' + sectionId).css('display', 'block');
            restoreVideos(sectionId);
            $('.nav-link[data-section="events"]').addClass('active');
        } else if (sectionId === 'entry') {
            console.log('エントリーセクション単独表示:', sectionId);
            $('#' + sectionId).css('display', 'block');
            $('.nav-link[data-section="' + sectionId + '"]').addClass('active');
        } else if (['home', 'events', 'winners', 'overview'].includes(sectionId)) {
            console.log('メインセクション表示:', sectionId);
            $('#home').css('display', 'block');
            $('#events').css('display', 'block');
            $('#winners').css('display', 'block');
            $('#overview').css('display', 'block');
            $('.nav-link[data-section="' + sectionId + '"]').addClass('active');
        } else {
            console.log('単独表示:', sectionId);
            $('#' + sectionId).css('display', 'block');
            $('.nav-link[data-section="' + sectionId + '"]').addClass('active');
        }

        console.log('表示セクション:', $('.section').map(function() {
            return { id: this.id, display: $(this).css('display') };
        }).get());
    }

    // ナビクリック
    $(document).on('click', '.nav-link, .news-button', function(e) {
        e.preventDefault();
        var sectionId = $(this).data('section');
        console.log('クリック:', sectionId, '履歴数:', history.length);
        if (!$('#' + sectionId).length) {
            console.error('セクションが見つかりません:', sectionId);
            return;
        }

        if (['summer1', 'winter1', 'summer2', 'winter2'].includes(sectionId)) {
            history.replaceState({ sectionId: sectionId }, '', '#' + sectionId);
        } else {
            history.pushState({ sectionId: sectionId }, '', '#' + sectionId);
            console.log('履歴追加:', sectionId);
        }

        showSection(sectionId);
        var headerHeight = $('header.fixed-header').outerHeight();
        $('html, body').animate({
            scrollTop: $('#' + sectionId).offset().top - headerHeight
        }, 500);
    });

    // 戻る/進むボタンの処理
    $(window).on('popstate', function(event) {
        var state = event.originalEvent.state;
        var sectionId = state && state.sectionId ? state.sectionId : (window.location.hash.replace('#', '') || 'home');
        console.log('popstateイベント:', sectionId, 'state:', state, '履歴数:', history.length);

        if (['summer1', 'winter1', 'summer2', 'winter2'].includes(sectionId)) {
            sectionId = 'events';
            history.replaceState({ sectionId: 'events' }, '', '#events');
            console.log('動画セクションからeventsにリダイレクト');
        }

        showSection(sectionId);
        var headerHeight = $('header.fixed-header').outerHeight();
        $('html, body').animate({
            scrollTop: $('#' + sectionId).offset().top - headerHeight
        }, 500);
    });

    // 初期表示
    console.log('初期表示開始', '履歴数:', history.length);
    var initialSection = window.location.hash.replace('#', '') || 'home';
    if (['summer1', 'winter1', 'summer2', 'winter2'].includes(initialSection)) {
        initialSection = 'events';
        history.replaceState({ sectionId: 'events' }, '', '#events');
    } else {
        history.replaceState({ sectionId: initialSection }, '', '#' + initialSection);
    }
    showSection(initialSection);
});