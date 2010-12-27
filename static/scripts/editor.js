

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
}

var activeXhr = null;
var lastContent = null;

function genPreview() {
    var self = $('#editor');
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

function showLinkDialog(url) {
    var showLinker = $('.showLinkDialog');
            
    var self = $('#show_link');
    var offs = self.offset();
    showLinker.find('input').val(url);
    showLinker.css({
        'left': offs.left + self.width() - showLinker.width(),
        'top': $('#navigation').offset().top + $('#navigation').height()
    }).css('visibility', 'visible').show();
}


$(function() {
	//$('<button>Conver!</button>').click(genPreview).appendTo($('body'));
	$('#editor').bind('change', genPreview).markItUp(mySettings);
	timerId = window.setInterval(genPreview, 900);
	window.setTimeout(function() {
		$('#editor-td > div').css({'width': '100%', 'height': '96%'});
	}, 200);
	
	$('.themes input').bind('change', function() {
		lastContent = null;
		genPreview()
	});
	
	$('.showLinkDialog .hider').click(function() {
		$('.showLinkDialog').hide('slow');
	});
	
	
	$('#show_link').click(function(e) {
		
		$.ajax({
			'url': '/srv/save_rst/',
			'type': 'POST',
			'data': {'rst': $('#editor').val()},
			'success': function(response) {
				showLinkDialog(getCurrentLink(response + ''));
			}
		})
		
		e.preventDefault();
		return false;
	});
});
