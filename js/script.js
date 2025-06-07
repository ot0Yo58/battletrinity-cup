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
            var src = iframe.attr('src');
            if (src) {
                iframe.attr('src', '');
                iframe.attr('data-src', src);
                console.log('動画停止:', src);
            }
        });
    }

    // 動画復元関数（変更なし）
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

    // フォームの状態を初期化する関数
    function initializeForm(formId, addButtonId, membersGroupId) {
        console.log(`フォーム初期化: ${formId}`);
        $(`${membersGroupId} .additional-member`).css('display', 'none');
        $(addButtonId).prop('disabled', false);
    }

    // セクション表示
    function showSection(sectionId) {
        console.log('showSection:', sectionId);
        stopAllVideos();
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
            restoreVideos(sectionId);
            // フォームセクションの場合、状態を初期化
            if (sectionId === 'form-section') {
                initializeForm('#join-form', '#add-member', '#members-group');
            } else if (sectionId === 'matching-form-section') {
                initializeForm('#matching-join-form', '#matching-add-member', '#matching-members-group');
            }
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

    // 参加フォーム：連絡手段の表示状態を更新する関数
    function updateJoinContactUsernameDisplay() {
        var contactMethod = $('input[name="contact-method"]:checked').val();
        console.log('参加フォーム：連絡手段チェック:', contactMethod);
        if (contactMethod === 'Discord' || contactMethod === 'X') {
            $('#contact-username-group').css({
                'display': 'block',
                'opacity': '0'
            }).animate({ opacity: 1 }, 300);
            $('#contact-username').prop('required', true).addClass('form-input');
        } else {
            $('#contact-username-group').animate({ opacity: 0 }, 300, function() {
                $(this).css('display', 'none');
            });
            $('#contact-username').prop('required', false).val('').removeClass('form-input');
        }
        validateForm();
    }

    // 参加フォーム：連絡手段の変更イベント
    $('#join-form input[name="contact-method"]').on('change', function() {
        console.log('参加フォーム：連絡手段変更:', $(this).val());
        updateJoinContactUsernameDisplay();
    });

    // 参加フォーム：初期表示時に連絡手段をチェック
    updateJoinContactUsernameDisplay();

    // 参加フォーム：バリデーション
    function validateForm() {
        console.log('参加フォーム：バリデーション実行');
        var requiredFields = [
            '#leader-name',
            '#leader-id',
            '#member1',
            '#member2',
            '#member3',
            '#member4',
            'input[name="contact-method"]:checked'
        ];
        var contactMethod = $('input[name="contact-method"]:checked').val();
        if (contactMethod === 'Discord' || contactMethod === 'X') {
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

    // 参加フォーム：入力変更時にバリデーション
    $('#join-form input[required], #join-form input[name="contact-method"], #contact-username').on('input change', function() {
        console.log('参加フォーム：入力変更検知:', $(this).attr('id') || $(this).attr('name'));
        validateForm();
    });

    // 参加フォーム：メンバー追加ボタン
    $(document).on('click', '#add-member', function(e) {
        e.preventDefault();
        console.log('参加フォーム：メンバー追加ボタンクリック');
        var hiddenMembers = $('#members-group .additional-member').filter(function() {
            return $(this).css('display') === 'none';
        });
        console.log('参加フォーム：隠れているメンバー入力欄の数:', hiddenMembers.length);
        if (hiddenMembers.length > 0) {
            var nextMember = hiddenMembers.first();
            nextMember.css('display', 'block');
            console.log('参加フォーム：表示したメンバー入力欄:', nextMember.find('input').attr('id'));
            if (hiddenMembers.length === 1) {
                $('#add-member').prop('disabled', true);
                console.log('参加フォーム：メンバー追加ボタンを無効化');
            }
        } else {
            console.log('参加フォーム：追加可能なメンバー入力欄がありません');
        }
    });

    // 参加フォーム：フォーム送信
    $('#join-form').on('submit', function(e) {
        e.preventDefault();
        console.log('参加フォーム：フォーム送信');
        var formData = {
            teamName: $('#team-name').val().trim() || '未定',
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
            remarks: $('#remarks').val().trim() || 'なし'
        };
        if ($('#member5').val().trim()) {
            formData.members.push($('#member5').val().trim());
        }
        if ($('#member6').val().trim()) {
            formData.members.push($('#member6').val().trim());
        }
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
        var webhookUrl = 'https://discordapp.com/api/webhooks/1375090624398889031/isNg6Ga8cCJ8eaZaHcDNY5vQFGF0tkuRvHsu1QIjLDvchPv2LG9WM_GEac-6Z9avjYvJ';
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
                $('#contact-username-group').css('display', 'none');
                $('#contact-username').prop('required', false).val('');
                // フォームの状態をリセット
                initializeForm('#join-form', '#add-member', '#members-group');
                updateJoinContactUsernameDisplay();
                validateForm();
            },
            error: function(xhr, status, error) {
                console.error('Webhook送信失敗:', status, error);
                alert('送信に失敗しました。もう一度お試しください。');
            }
        });
    });

    // 運営マッチングフォーム：連絡手段の表示状態を更新
    function updateMatchingContactUsernameDisplay() {
        var contactMethod = $('input[name="matching-contact-method"]:checked').val();
        console.log('運営マッチング：連絡手段チェック:', contactMethod);
        if (contactMethod === 'Discord' || contactMethod === 'X') {
            $('#matching-contact-username-group').css('display', 'block');
            $('#matching-contact-username').prop('required', true);
        } else {
            $('#matching-contact-username-group').css('display', 'none');
            $('#matching-contact-username').prop('required', false).val('');
        }
        validateMatchingForm();
    }

    // 運営マッチングフォーム：連絡手段の変更イベント
    $('#matching-join-form input[name="matching-contact-method"]').on('change', function() {
        console.log('運営マッチング：連絡手段変更:', $(this).val());
        updateMatchingContactUsernameDisplay();
    });

    // 運営マッチングフォーム：初期表示時に連絡手段をチェック
    updateMatchingContactUsernameDisplay();

    // 運営マッチングフォーム：バリデーション
    function validateMatchingForm() {
        console.log('運営マッチングバリデーション実行');
        var requiredFields = [
            '#rep-name',
            '#rep-id',
            'input[name="matching-contact-method"]:checked'
        ];
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

    // 運営マッチングフォーム：入力変更時にバリデーション
    $('#matching-join-form input[required], #matching-join-form input[name="matching-contact-method"], #matching-contact-username').on('input change', function() {
        console.log('運営マッチング：入力変更検知:', $(this).attr('id') || $(this).attr('name'));
        validateMatchingForm();
    });

    // 運営マッチングフォーム：メンバー追加ボタン
    $(document).on('click', '#matching-add-member', function(e) {
        e.preventDefault();
        console.log('運営マッチング：メンバー追加ボタンクリック');
        var hiddenMembers = $('#matching-members-group .additional-member').filter(function() {
            return $(this).css('display') === 'none';
        });
        console.log('運営マッチング：隠れているメンバー入力欄の数:', hiddenMembers.length);
        if (hiddenMembers.length > 0) {
            var nextMember = hiddenMembers.first();
            nextMember.css('display', 'block');
            console.log('運営マッチング：表示したメンバー入力欄:', nextMember.find('input').attr('id'));
            if (hiddenMembers.length === 1) {
                $('#matching-add-member').prop('disabled', true);
                console.log('運営マッチング：メンバー追加ボタンを無効化');
            }
        } else {
            console.log('運営マッチング：追加可能なメンバー入力欄がありません');
        }
    });

    // 運営マッチングフォーム：フォーム送信
    $('#matching-join-form').on('submit', function(e) {
        e.preventDefault();
        console.log('運営マッチングフォーム送信');
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
        var message = `📢 運営マッチング新しい登録！\n` +
                      `👤 代表者: ${formData.repName || '不明'}\n` +
                      `🆔 代表者キャラID: ${formData.repID || '不明'}\n` +
                      `📺 ライブ: ${formData.liveStatus || '不明'}\n` +
                      `💬 Discord: ${formData.discordStatus || '不明'}\n` +
                      `📩 連絡手段: ${formData.contactMethod || '不明'}\n` +
                      `👤 連絡ユーザー名: ${formData.contactUsername || 'なし'}\n` +
                      `👥 メンバー: ${formData.members.length ? formData.members.join(', ') : 'なし'}\n` +
                      `✍️ 備考: ${formData.remarks || 'なし'}`;
        var webhookUrl = 'https://discordapp.com/api/webhooks/1380029684838039643/cviJDJj4td8S-JnvsEUf-5uIBjTKGLEy63fdZvIRfahjNxyO5emTddFz8EVQo2bExdl4';
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
                // フォームの状態をリセット
                initializeForm('#matching-join-form', '#matching-add-member', '#matching-members-group');
                updateMatchingContactUsernameDisplay();
                validateMatchingForm();
            },
            error: function(xhr, status, error) {
                console.error('運営マッチングWebhook送信失敗:', status, error);
                alert('送信に失敗しました。もう一度お試しください。');
            }
        });
    });

    // 初期表示
    console.log('初期表示開始');
    var initialSection = window.location.hash.replace('#', '') || 'home';
    history.replaceState({ sectionId: initialSection }, '', '#' + initialSection);
    showSection(initialSection);
});