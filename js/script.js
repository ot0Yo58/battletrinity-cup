$(document).ready(function() {
    console.log('スクリプト開始');
    console.log('jQueryロード:', typeof jQuery);
    console.log('スライドショー要素:', $('.slideshow').length);
    console.log('home存在:', $('#home').length);

    // スライドショー
    var slideshowImages = [
        'images/summer1.jpg',
        'images/winter1.jpg',
        'images/summer2.jpg',
        'images/winter2.jpg'
    ];
    var currentImageIndex = 0;

    // 画像ロード確認
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

    // 動画停止関数
    function stopAllVideos() {
        console.log('すべての動画を停止');
        $('.video-container iframe').each(function() {
            var iframe = $(this);
            var src = iframe.attr('src');
            if (src) {
                // srcをリセットして再生を停止
                iframe.attr('src', '');
                // 必要に応じて元のsrcを復元（ただし即時再生はしない）
                iframe.attr('data-src', src);
                console.log('動画停止:', src);
            }
        });
    }

    // 動画再生関数（必要に応じて特定のセクションの動画を復元）
    function restoreVideos(sectionId) {
        console.log('動画復元:', sectionId);
        $(`#${sectionId} .video-container iframe`).each(function() {
            var iframe = $(this);
            var src = iframe.attr('data-src');
            if (src && !iframe.attr('src')) {
                iframe.attr('src', src);
                console.log('動画復元:', src);
            }
        });
    }

    // セクション表示
    function showSection(sectionId) {
        console.log('showSection:', sectionId);
        // すべての動画を停止
        stopAllVideos();
        // すべてのセクションを非表示
        $('.section').css('display', 'none');
        if (sectionId == 'home' || sectionId == 'events' || sectionId == 'winners' || sectionId == 'overview') {
            console.log('表示対象: home, events, winners, overview');
            $('#home').css('display', 'block');
            $('#events').css('display', 'block');
            $('#winners').css('display', 'block');
            $('#overview').css('display', 'block');
        } else {
            console.log('単独表示:', sectionId);
            $('#' + sectionId).css('display', 'block');
            // 対象セクションの動画を復元
            restoreVideos(sectionId);
        }
        console.log('表示セクション:', $('.section').map(function() {
            return { id: this.id, display: $(this).css('display') };
        }).get());

        $('.nav-link').removeClass('active');
        $('.nav-link[data-section="' + sectionId + '"]').addClass('active');
    }

    // ナビクリック
    $(document).on('click', '.nav-link, .news-button', function(e) {
        e.preventDefault();
        var sectionId = $(this).data('section');
        console.log('クリック:', sectionId);
        if (!$('#' + sectionId).length) {
            console.error('セクションが見つかりません:', sectionId);
            return;
        }

        // 履歴に状態を追加
        history.pushState({ sectionId: sectionId }, '', '#' + sectionId);

        var headerHeight = $('header.fixed-header').outerHeight();
        showSection(sectionId);
        $('html, body').animate({
            scrollTop: $('#' + sectionId).offset().top - headerHeight
        }, 500);
    });

    // 戻る/進むボタンの処理
    $(window).on('popstate', function(event) {
        var state = event.originalEvent.state;
        var sectionId = state && state.sectionId ? state.sectionId : (window.location.hash.replace('#', '') || 'home');
        console.log('popstateイベント:', sectionId);
        showSection(sectionId);

        var headerHeight = $('header.fixed-header').outerHeight();
        $('html, body').animate({
            scrollTop: $('#' + sectionId).offset().top - headerHeight
        }, 500);
    });

    // 以下、参加フォームおよび運営マッチングフォームのコードは変更なし（省略）
    // （必要に応じて元のコードをそのまま使用）

    // 初期表示
    console.log('初期表示開始');
    var initialSection = window.location.hash.replace('#', '') || 'home';
    history.replaceState({ sectionId: initialSection }, '', '#' + initialSection);
    showSection(initialSection);
});