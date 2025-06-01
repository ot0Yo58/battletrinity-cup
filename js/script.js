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

    // セクション表示
    function showSection(sectionId) {
        console.log('showSection:', sectionId);
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
        }
        console.log('表示セクション:', $('.section').map(function() {
            return { id: this.id, display: $(this).css('display') };
        }).get());
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
        var headerHeight = $('header.fixed-header').outerHeight();
        showSection(sectionId);
        $('html, body').animate({
            scrollTop: $('#' + sectionId).offset().top - headerHeight
        }, 500);
    });

    // メンバー追加
    $(document).on('click', '#add-member', function() {
        console.log('メンバー追加クリック');
        var hiddenMembers = $('.additional-member[hidden]');
        if (hiddenMembers.length > 0) {
            var nextMember = hiddenMembers.first();
            nextMember.removeAttr('hidden');
            console.log('表示したメンバー:', nextMember.find('input').attr('id'));
            if (hiddenMembers.length === 1) {
                $('#add-member').prop('disabled', true);
                console.log('ボタン無効化');
            }
        } else {
            console.log('追加メンバーなし');
        }
    });

    // フォームバリデーション
    function validateForm() {
        console.log('バリデーション実行');
        var requiredFields = [
            '#team-name',
            '#leader-name',
            '#leader-id',
            '#member1',
            '#member2',
            '#member3',
            '#member4'
        ];
        var allFilled = requiredFields.every(function(id) {
            var value = $(id).val().trim();
            console.log('チェック:', id, '値:', value);
            return value !== '';
        });
        console.log('必須項目すべて入力:', allFilled);
        $('.form-submit').prop('disabled', !allFilled);
    }

    // 入力変更時にバリデーション
    $('#join-form input[required]').on('input change', validateForm);

    // フォーム送信（Discord Webhook）
    $('#join-form').on('submit', function(e) {
        e.preventDefault();
        console.log('フォーム送信');

        // フォームデータ収集
        var formData = {
            teamName: $('#team-name').val().trim(),
            leaderName: $('#leader-name').val().trim(),
            leaderID: $('#leader-id').val().trim(),
            members: [
                $('#member1').val().trim(),
                $('#member2').val().trim(),
                $('#member3').val().trim(),
                $('#member4').val().trim()
            ],
            liveStatus: $('input[name="live-status"]:checked').val() === 'yes' ? '可' : '不可',
            discordStatus: $('input[name="discord-status"]:checked').val() === 'yes' ? '可' : '不可',
            remarks: $('#remarks').val().trim()
        };

        // 追加メンバー
        if ($('#member5').val().trim()) {
            formData.members.push($('#member5').val().trim());
        }
        if ($('#member6').val().trim()) {
            formData.members.push($('#member6').val().trim());
        }

        // Discordメッセージ整形
        var message = `📢 新しい登録！\n` +
                      `🏆 チーム: ${formData.teamName || '不明'}\n` +
                      `👑 リーダー: ${formData.leaderName || '不明'}\n` +
                      `🆔 リーダーキャラID: ${formData.leaderID || '不明'}\n` +
                      `📺 ライブ: ${formData.liveStatus || '不明'}\n` +
                      `💬 Discord: ${formData.discordStatus || '不明'}\n` +
                      `👥 メンバー: ${formData.members.length ? formData.members.join(', ') : 'なし'}\n` +
                      `✍️ 備考: ${formData.remarks || 'なし'}`;

        // Webhook送信
        var webhookUrl = 'https://discordapp.com/api/webhooks/1375090624398889031/isNg6Ga8cCJ8eaZaHcDNY5vQFGF0tkuRvHsu1QIjLDvchPv2LG9WM_GEac-6Z9avjYvJ'; // ★要置換
        $.ajax({
            url: webhookUrl,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                content: message
            }),
            success: function() {
                console.log('Webhook送信成功');
                $('#success-message').css('display', 'block');
                $('.form-submit').prop('disabled', true);
                $('#join-form')[0].reset();
                $('.additional-member').attr('hidden', true);
                $('#add-member').prop('disabled', false);
                validateForm();
            },
            error: function(xhr, status, error) {
                console.error('Webhook送信失敗:', status, error);
                alert('送信に失敗しました。もう一度お試しください。');
            }
        });
    });

    // 初期バリデーション
    validateForm();

    // 初期表示
    console.log('初期表示開始');
    var initialSection = window.location.hash.replace('#', '') || 'home';
    showSection(initialSection);
});