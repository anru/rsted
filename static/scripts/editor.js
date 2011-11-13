

function getSelectedTheme() {
    var theme = null;
    $('.themes input').each(function() {
        if (this.checked) {
            theme = this.value;
            return false;
        }
    })
    return theme;
}

function getQueryArgs(locSearch) {
    locSearch = locSearch || window.location.search;
    var args = {};

    locSearch.replace(/(\w+)=(.+?)(&|$)/g, function(substr, key, value) {
        args[key] = window.decodeURIComponent(value);
    });
    return args;
}

function getCurrentDocument() {
    return getQueryArgs()['n'];
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

var activeXhr = null;
var lastContent = null;

function genPreview() {
    var self = $('textarea#editor');
    var rstContent = self.val();
    if (activeXhr || lastContent == rstContent) {
        //activeXhr.abort();
        return;
    }
    lastContent = rstContent;
    activeXhr = $.ajax({
        'url': '/srv/rst2html/',
        'data': {'rst': rstContent, 'theme': getSelectedTheme()},
        'type': 'POST',
        'error': function(xhr) {
            setPreviewHtml(xhr.responseText);
        },
        'success': function(response) {
            setPreviewHtml(response);
            activeXhr = null;
        }
    });
}

var timerId = null;

function getCurrentLink(res) {
    if (!res) {
        return 'http://' + window.location.host + '/?theme=' + getSelectedTheme();
    }
    return 'http://' + window.location.host + '/?n=' + res + '&theme=' + getSelectedTheme();
}

function adjustBrowse() {
    var h = $('body').height() - $('#browse').offset().top - $('#footer').outerHeight() - 7;
    $('#browse').height(h);
    h -= 12;
    $('#editor').height(h).css('max-height', h + 'px');
}


$(function() {
    //$('<button>Conver!</button>').click(genPreview).appendTo($('body'));
    
    window.baseTitle = $('head title').text();

    $('textarea#editor').bind('change', genPreview).markItUp(mySettings);
    timerId = window.setInterval(genPreview, 900);
    window.setTimeout(function() {
        $('#editor-td > div').css({'width': '100%', 'height': '96%'});
    }, 200);

    $('.themes input').bind('change', function() {
        lastContent = null;
        genPreview();
    });

    $('#save_link').click(function(e) {

        $.ajax({
            'url': '/srv/save_rst/',
            'type': 'POST',
            'data': {'rst': $('textarea#editor').val()},
            'success': function(response) {
                window.location = getCurrentLink(response + '');
                $('textarea#editor').focus();
            }

        });

        e.preventDefault();
        return false;
    });

    $('#del_link').click(function(e) {
        $.ajax({
            'url': '/srv/del_rst/',
            'type': 'GET',
            'data': {'n': getCurrentDocument()},
            'success': function(response) {
                window.location = getCurrentLink();
            }
        });

        e.preventDefault();
        return false;
    });

    $('#as_pdf').click(function(e) {
        var form = $('#save_as_pdf');
        $('#as_pdf_rst').attr('value', $("#editor").val());
        $('#as_pdf_theme').attr('value', getSelectedTheme());
        form.submit();

        e.preventDefault();
        return false;
    });

     adjustBrowse();

     $(window).bind('resize', adjustBrowse);

});
