

function getSelectedTheme() {
    var theme = null;
    $('.themes input').each(function() {
        if (this.checked) {
            theme = this.value;
            return false;
        }
    });
    return theme;
}

function b64EncodeUnicode(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
    }));
}

function b64DecodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

function getQueryArgs(locSearch) {
    locSearch = locSearch || window.location.search;
    var args = {};

    locSearch.replace(/(\w+)=(.+?)(&|$)/g, function(substr, key, value) {
        args[key] = window.decodeURIComponent(value);
    });
    return args;
}


function setPreviewHtml(html) {
    var iframe = $('#browse')[0];
    var doc = iframe.document;

    if (iframe.contentDocument) {
        doc = iframe.contentDocument; // For NS6
    } else if (iframe.contentWindow) {
        doc = iframe.contentWindow.document; // For IE5.5 and IE6
    }
    doc.open();
    doc.writeln(html);
    doc.close();
    var body = doc.body;

    var titleText = null;
    var headElem = $('h1', body)[0] || $('h2', body)[0] || $('h3', body)[0] || $('h4', body)[0] || $('h5', body)[0] || $('p', body)[0];
    if (headElem) {
        titleText = headElem.innerText || headElem.textContent;
    }
    if (titleText) {
        $('head title').html(titleText.substr(0, 55) + ' - ' + window.baseTitle);
    } else {
        $('head title').html(window.baseTitle);
    }
}

function getScrollHeight($prevFrame) {
    // Different browsers attach the scrollHeight of a document to different
    // elements, so handle that here.
    if ($prevFrame[0].scrollHeight !== undefined) {
        return $prevFrame[0].scrollHeight;
    } else if ($prevFrame.find('html')[0].scrollHeight !== undefined &&
               $prevFrame.find('html')[0].scrollHeight !== 0) {
        return $prevFrame.find('html')[0].scrollHeight;
    } else {
        return $prevFrame.find('body')[0].scrollHeight;
    }
}

/**
 * syncScrollPosition
 *
 * Synchronize the scroll positions between the editor and preview panes.
 * Specifically, this function will match the percentages that each pane is
 * scrolled (i.e., if one is scrolled 25% of its total scroll height, the
 * other will be too).
 */
function syncScrollPosition() {
    var $ed = $('textarea#editor');
    var $prev = $('#browse');

    var editorScrollRange = ($ed[0].scrollHeight - $ed.innerHeight());
    var previewScrollRange = (getScrollHeight($prev.contents()) - $prev.innerHeight());

    // Find how far along the editor is (0 means it is scrolled to the top, 1
    // means it is at the bottom).
    var scrollFactor = $ed.scrollTop() / editorScrollRange;

    // Set the scroll position of the preview pane to match.  jQuery will
    // gracefully handle out-of-bounds values.
    $prev.contents().scrollTop(scrollFactor * previewScrollRange);
}

var activeXhr = null;
var lastContent = null;
var renderedHash = null;

function probablyChanged() {
    var self = $('#editor');
    var rstContent = self.val();
    if (activeXhr || lastContent == rstContent) {
        //activeXhr.abort();
        return;
    }
    syncHashAndUpdate();
}

function genPreview() {
    var self = $('#editor');
    var rstContent = self.val();

    lastContent = rstContent;
    activeXhr = $.ajax({
        'url': script_root + '/srv/rst2html/',
        'data': {'rst': rstContent, 'theme': getSelectedTheme()},
        'type': 'POST',
        'error': function(xhr) {
            setPreviewHtml(xhr.responseText);
            activeXhr = null;
        },
        'success': function(response) {
            setPreviewHtml(response);
            syncScrollPosition();
            activeXhr = null;
        }
    });
}

var timerId = null;

function syncState(rst) {
    location.hash = '#' + b64EncodeUnicode(rst);
}

function syncHashAndUpdate() {
    var self = $('#editor');
    var rstContent = self.val();
    syncState(rstContent);
    genPreview();
}

function getDecodedHash() {
    return b64DecodeUnicode(location.hash.substr(1));
}

window.onhashchange = function(ev) {
    $('textarea#editor').val(getDecodedHash());
}

function reactForTheme(theme) {
    $('.themes input[value='+ theme + ']')[0].checked = true;
    $('#as_pdf_theme').attr('value', getSelectedTheme());
}

function reactForRst(rst) {
    $('#editor').val(rst)
}

window.onpopstate = function(ev) {
    var doUpdate = false;
    var stateTheme = getQueryArgs()['theme'] || 'basic';
    if (stateTheme != getSelectedTheme()) {
        reactForTheme(stateTheme)
        doUpdate = true;
    }
    if (getDecodedHash() != lastContent) {
        reactForRst(getDecodedHash())
        doUpdate = true;
    }

    if (doUpdate) {
        genPreview();
    }
}

function adjustBrowse() {
    var h = $('body').height() - $('#browse').offset().top - $('#footer').outerHeight() - 7;
    $('#browse').height(h);
    h -= 12;
    $('#editor').height(h).css('max-height', h + 'px');
}


$(function() {
    window.baseTitle = $('head title').text();

    $('textarea#editor').bind('change', probablyChanged).markItUp(mySettings);
    timerId = window.setInterval(probablyChanged, 900);
    window.setTimeout(function() {
        $('#editor-td > div').css({'width': '100%', 'height': '96%'});
    }, 200);

    $('textarea#editor').scroll(syncScrollPosition);

    $('.themes input').bind('change', function() {
        history.pushState({theme: getSelectedTheme()}, document.title, '/?theme=' + getSelectedTheme() + location.hash);
        genPreview();
    });

    adjustBrowse();

    $(window).bind('resize', adjustBrowse);
});
