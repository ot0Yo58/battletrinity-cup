// js/script.js （トップページだけSPA処理を動かす安全版）

// headにEvent JSON-LDが無ければ保険で注入
(function() {
  var hasEventJsonLd = !!document.querySelector('script[type="application/ld+json"]');
  if (!hasEventJsonLd) {
    var base = location.href.split('#')[0];
    var ld = {
      "@context":"https://schema.org",
      "@type":"Event",
      "name":"バトルトリニティ 第三回サマーカップ",
      "startDate":"2025-07-26T22:00:00+09:00",
      "eventAttendanceMode":"https://schema.org/OnlineEventAttendanceMode",
      "eventStatus":"https://schema.org/EventScheduled",
      "location":{"@type":"VirtualLocation","url": base + "#news"},
      "description":"抽選会は 2025-07-19 22:00。エントリー期間は 06/06〜07/18。",
      "organizer":{"@type":"Organization","name":"バトルトリニティカップ運営"},
      "image":[base + "images/summer3.jpg"],
      "url": base
    };
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.text = JSON.stringify(ld);
    document.head.appendChild(s);
  }
})();

document.addEventListener('DOMContentLoaded', function() {
  // ここでトップページかどうかを判定（#home があればトップ）
  var isTop = !!document.getElementById('home');

  // ===== スライドショー（トップに .slideshow があるときだけ動作）=====
  if (document.querySelector('.slideshow')) {
    var slideshowImages = [
      'images/summer1.jpg',
      'images/winter1.jpg',
      'images/summer2.jpg',
      'images/winter2.jpg'
    ];
    var currentImageIndex = 0;

    function updateSlideshow() {
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
  }

  // ===== 以降のSPAナビはトップページだけで実行 =====
  if (!isTop) {
    // 個別ページでは何もしない（表示を隠さない）
    return;
  }

  function showSection(sectionId) {
    $('.section').hide();
    $('.nav-link').removeClass('active');

    if (['home','events','winners','overview','news','entry'].includes(sectionId)) {
      if (['home','events','winners','overview'].includes(sectionId)) {
        $('#home,#events,#winners,#overview').show();
      } else {
        $('#' + sectionId).show();
      }
      $('.nav-link[data-section="' + sectionId + '"]').addClass('active');
    } else {
      $('#home,#events,#winners,#overview').show();
      $('.nav-link[data-section="home"]').addClass('active');
    }
  }

  // ヘッダーナビ＆「エントリーはこちら」のみJSでスムーズスクロール
  $(document).on('click', '.nav-link, .news-button.nav-link', function(e) {
    e.preventDefault();
    var sectionId = $(this).data('section');
    history.pushState({ sectionId: sectionId }, '', '#' + sectionId);
    showSection(sectionId);
    var headerHeight = $('header.fixed-header').outerHeight();
    $('html, body').animate({ scrollTop: $('#' + sectionId).offset().top - headerHeight }, 500);
  });

  $(window).on('popstate', function(event) {
    var state = event.originalEvent.state;
    var sectionId = state && state.sectionId ? state.sectionId : (location.hash.replace('#','') || 'home');
    showSection(sectionId);
    var headerHeight = $('header.fixed-header').outerHeight();
    $('html, body').animate({ scrollTop: $('#' + sectionId).offset().top - headerHeight }, 500);
  });

  var initialSection = location.hash.replace('#','') || 'home';
  showSection(initialSection);
});
