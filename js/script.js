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

/// 連絡手段の変更時にユーザー名入力欄を表示/非表示
$('#join-form input[name="contact-method"]').on('change', function() {
    var contactMethod = $(this).val();
    console.log('連絡手段変更:', contactMethod);
    if (contactMethod === 'Discord' || contactMethod === 'X') {
        $('#contact-username-group').removeAttr('hidden');
        $('#contact-username').prop('required', true);
    } else {
        $('#contact-username-group').attr('hidden', true);
        $('#contact-username').prop('required', false).val('');
    }
    validateForm();
});

// フォームバリデーション
function validateForm() {
    console.log('バリデーション実行');
    var requiredFields = [
        '#leader-name',
        '#leader-id',
        '#member1',
        '#member2',
        '#member3',
        '#member4',
        'input[name="contact-method"]:checked'
    ];
    if ($('input[name="contact-method"]:checked').val() === 'Discord' || $('input[name="contact-method"]:checked').val() === 'X') {
        requiredFields.push('#contact-username');
    }
    var allFilled = requiredFields.every(function(id) {
        var value = $(id).val();
        if (typeof value === 'string') {
            value = value.trim();
        }
        console.log('チェック:', id, '値:', value);
        return value !== '' && value !== null && value !== undefined;
    });
    console.log('必須項目すべて入力:', allFilled);
    $('#join-form .form-submit').prop('disabled', !allFilled);
}

// 連絡手段の変更時にユーザー名入力欄を表示/非表示
$('#join-form input[name="contact-method"]').on('change', function() {
    var contactMethod = $(this).val();
    console.log('連絡手段変更:', contactMethod);
    if (contactMethod === 'Discord' || contactMethod === 'X') {
        $('#contact-username-group').removeAttr('hidden');
        $('#contact-username').prop('required', true);
        $('#contact-username').addClass('form-input'); // スタイル一貫性
    } else {
        $('#contact-username-group').attr('hidden', true);
        $('#contact-username').prop('required', false).val('');
    }
    validateForm();
});

// 入力変更時にバリデーション
$('#join-form input[required], #join-form input[name="contact-method"], #contact-username').on('input change', function() {
    console.log('入力変更検知:', $(this).attr('id') || $(this).attr('name'));
    validateForm();
});

// フォーム送信（Discord Webhook）
$('#join-form').on('submit', function(e) {
    e.preventDefault();
    console.log('フォーム送信');

    // フォームデータ収集
    var formData = {
        teamName: $('#team-name').val().trim() || '未定', // 空の場合「未定」を設定
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
        contactMethod: $('input[name="contact-method"]:checked').val() || '不明',
        contactUsername: $('#contact-username').val().trim() || 'なし',
        remarks: $('#remarks').val().trim() || 'なし' // 備考を追加
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
                  `🏆 チーム: ${formData.teamName}\n` +
                  `👑 リーダー: ${formData.leaderName || '不明'}\n` +
                  `🆔 リーダーキャラID: ${formData.leaderID || '不明'}\n` +
                  `📺 ライブ: ${formData.liveStatus || '不明'}\n` +
                  `💬 Discord: ${formData.discordStatus || '不明'}\n` +
                  `📩 連絡手段: ${formData.contactMethod || '不明'}\n` +
                  `👤 連絡ユーザー名: ${formData.contactUsername || 'なし'}\n` +
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
            $('#join-form .form-submit').prop('disabled', true);
            $('#join-form')[0].reset();
            $('#contact-username-group').attr('hidden', true);
            $('#contact-username').prop('required', false).val('');
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

// 初期表示時に連絡手段をチェック
$(document).ready(function() {
    if ($('input[name="contact-method"]:checked').val() === 'Discord' || $('input[name="contact-method"]:checked').val() === 'X') {
        $('#contact-username-group').removeAttr('hidden');
        $('#contact-username').prop('required', true);
    } else {
        $('#contact-username-group').attr('hidden', true);
        $('#contact-username').prop('required', false);
    }
    validateForm();
});


// 運営マッチングフォームバリデーション
function validateMatchingForm() {
    console.log('運営マッチングバリデーション実行');
    var requiredFields = [
        '#rep-name',
        '#rep-id',
        'input[name="matching-contact-method"]:checked'
    ];

    // 連絡手段がDiscordまたはXの場合、ユーザー名を必須に
    var contactMethod = $('input[name="matching-contact-method"]:checked').val();
    if (contactMethod === 'Discord' || contactMethod === 'X') {
        requiredFields.push('#matching-contact-username');
    }

    var allFilled = requiredFields.every(function(id) {
        var value = $(id).val();
        if (typeof value === 'string') {
            value = value.trim();
        }
        console.log('チェック:', id, '値:', value);
        return value !== '' && value !== null && value !== undefined;
    });

    console.log('必須項目すべて入力:', allFilled);
    $('#matching-join-form .form-submit').prop('disabled', !allFilled);
}

// 連絡手段の変更時にユーザー名入力欄を表示/非表示
$('#matching-join-form input[name="matching-contact-method"]').on('change', function() {
    var contactMethod = $(this).val();
    console.log('連絡手段変更:', contactMethod);
    if (contactMethod === 'Discord' || contactMethod === 'X') {
        $('#matching-contact-username-group').removeAttr('hidden');
        $('#matching-contact-username').prop('required', true);
    } else {
        $('#matching-contact-username-group').attr('hidden', true);
        $('#matching-contact-username').prop('required', false).val('');
    }
    validateMatchingForm(); // バリデーションを即時実行
});

// 入力変更時にバリデーション
$('#matching-join-form input[required], #matching-join-form input[name="matching-contact-method"], #matching-contact-username').on('input change', function() {
    console.log('入力変更検知:', $(this).attr('id') || $(this).attr('name'));
    validateMatchingForm();
});

// 運営マッチングフォーム送信（Discord Webhook）
$('#matching-join-form').on('submit', function(e) {
    e.preventDefault();
    console.log('運営マッチングフォーム送信');

    // フォームデータ収集
    var formData = {
        repName: $('#rep-name').val().trim(),
        repID: $('#rep-id').val().trim(),
        members: [],
        liveStatus: $('input[name="matching-live-status"]:checked').val() === 'yes' ? '可' : '不可',
        discordStatus: $('input[name="matching-discord-status"]:checked').val() === 'yes' ? '可' : '不可',
        contactMethod: $('input[name="matching-contact-method"]:checked').val() || '不明',
        contactUsername: $('#matching-contact-username').val().trim() || 'なし',
        remarks: $('#matching-remarks').val().trim() || 'なし'
    };

    // メンバー入力があれば追加
    if ($('#matching-member1').val().trim()) {
        formData.members.push($('#matching-member1').val().trim());
    }
    if ($('#matching-member2').val().trim()) {
        formData.members.push($('#matching-member2').val().trim());
    }
    if ($('#matching-member3').val().trim()) {
        formData.members.push($('#matching-member3').val().trim());
    }
    if ($('#matching-member4').val().trim()) {
        formData.members.push($('#matching-member4').val().trim());
    }

    // Discordメッセージ整形
    var message = `📢 運営マッチング新しい登録！\n` +
                  `👤 代表者: ${formData.repName || '不明'}\n` +
                  `🆔 代表者キャラID: ${formData.repID || '不明'}\n` +
                  `📺 ライブ: ${formData.liveStatus || '不明'}\n` +
                  `💬 Discord: ${formData.discordStatus || '不明'}\n` +
                  `📩 連絡手段: ${formData.contactMethod || '不明'}\n` +
                  `👤 連絡ユーザー名: ${formData.contactUsername || 'なし'}\n` +
                  `👥 メンバー: ${formData.members.length ? formData.members.join(', ') : 'なし'}\n` +
                  `✍️ 備考: ${formData.remarks || 'なし'}`;

    // Webhook送信
    var webhookUrl = 'https://discordapp.com/api/webhooks/1380029684838039643/cviJDJj4td8S-JnvsEUf-5uIBjTKGLEy63fdZvIRfahjNxyO5emTddFz8EVQo2bExdl4'; // ★要置換
    $.ajax({
        url: webhookUrl,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            content: message
        }),
        success: function() {
            console.log('運営マッチングWebhook送信成功');
            $('#matching-success-message').css('display', 'block');
            $('#matching-join-form .form-submit').prop('disabled', true);
            $('#matching-join-form')[0].reset();
            $('#matching-members-group .additional-member').attr('hidden', true);
            $('#matching-add-member').prop('disabled', false);
            $('#matching-contact-username-group').attr('hidden', true);
            $('#matching-contact-username').prop('required', false).val('');
            validateMatchingForm();
        },
        error: function(xhr, status, error) {
            console.error('運営マッチングWebhook送信失敗:', status, error);
            alert('送信に失敗しました。もう一度お試しください。');
        }
    });
});

// 初期表示時に連絡手段をチェック
$(document).ready(function() {
    var contactMethod = $('input[name="matching-contact-method"]:checked').val();
    if (contactMethod === 'Discord' || contactMethod === 'X') {
        $('#matching-contact-username-group').removeAttr('hidden');
        $('#matching-contact-username').prop('required', true);
    } else {
        $('#matching-contact-username-group').attr('hidden', true);
        $('#matching-contact-username').prop('required', false);
    }
    validateMatchingForm();
});

    // 初期表示
    console.log('初期表示開始');
    var initialSection = window.location.hash.replace('#', '') || 'home';
    showSection(initialSection);
});