// -------------------------------------------------------------------
// markItUp!
// -------------------------------------------------------------------
// Copyright (C) 2008 Jay Salvat
// http://markitup.jaysalvat.com/
// -------------------------------------------------------------------
// MarkDown tags example
// http://en.wikipedia.org/wiki/Markdown
// http://daringfireball.net/projects/markdown/
// -------------------------------------------------------------------
// Feel free to add more tags
// -------------------------------------------------------------------

// mIu nameSpace to avoid conflict.



miu = new function() {
	
	var tabWidth = 4;
	var self = this;
	
	var makeChars = function(ch, repeat) {
		var i = repeat;
		var r = '';
		while (i--) {
			r += ch;
		}
		return r;
	}
	
    var wcwidth = function (ucs) {
        if (ucs < 0x1100)
          return 1;
    
        if ((ucs >= 0x1100 && ucs <= 0x115f) || /* Hangul Jamo */
          (ucs >= 0x2e80 && ucs <= 0xa4cf && (ucs & ~0x0011) != 0x300a &&
           ucs != 0x303f) ||                     /* CJK ... Yi */
          (ucs >= 0xac00 && ucs <= 0xd7a3) || /* Hangul Syllables */
          (ucs >= 0xf900 && ucs <= 0xfaff) || /* CJK Compatibility Ideographs */
          (ucs >= 0xfe30 && ucs <= 0xfe6f) || /* CJK Compatibility Forms */
          (ucs >= 0xff00 && ucs <= 0xff5f) || /* Fullwidth Forms */
          (ucs >= 0xffe0 && ucs <= 0xffe6)) {
        return 2;
        }
        return 1;
    }
	
	var strByteLen = this.strByteLen = function(str) {
      var count = 0;
      for(var i=0; i < str.length; i++) {
          count += wcwidth(str.charCodeAt(i));
      }
      return count;
	}
	
    this.markText = function(markItUp, ch, breakBefore) {
        if (typeof breakBefore == 'undefined') {
            breakBefore = true;
        }
        var heading = '';
        var n = strByteLen($.trim(markItUp.selection||markItUp.placeHolder));
        for(var i = 0; i < n; i++) {
            heading += ch;
        }
        if (breakBefore) {
            return '\n'+heading;
        } else {
            return heading + '\n';
        }
    },
    
    this.makeMarkDown = function(ch) {
        return function(markItUp) {
            return self.markText(markItUp, ch);
        };
    },
    
    this.makeMarkUp = function(ch){
		return function(markItUp){
			return self.markText(markItUp, ch, false);
		};
	},
	
	this.makeIndent = function(h) {
		if (!h.selection) {
			return  makeChars(' ', tabWidth);
		} else {
			var lines = h.selection.split('\n');
			var len = lines.length;
			for (var i = 0; i < len; i++) {
				lines[i] = makeChars(' ', tabWidth) + lines[i];
			}
			return lines.join('\n');
		}
	},
	
	this.removeIndent = function(h) {
        if (h.selection) {
            var lines = h.selection.split('\n');
            var len = lines.length;
            for (var i = 0; i < len; i++) {
                var line = lines[i];
				var offs = 0;
				for (var j = 0; j < tabWidth; j++) {
					if (line.charAt(j) == ' ' || line.charAt(j) == '\t') {
						offs += 1;
					} else {
						break;
					}
				}
				lines[i] = line.substr(offs);
            }
            return lines.join('\n');
        }
	}
}

function restLink(markItUp) {
	var link = markItUp.selection;
	if (!link) {
		link = '[![Title]!]'
	}
	return '`' + link + ' <[![Url:!:http://]!]>`_\n'
}

mySettings = {
	previewParserPath:	'',
	onShiftEnter:		{keepDefault:false, openWith:'\n\n'},
	markupSet: [
		{name:'# with overline, for parts', text:'##', key:'1', placeHolder:'Part title..', openWith: miu.makeMarkUp('='), closeWith: miu.makeMarkDown('=')},
		{name:'* with overline, for chapters', text:'**', key:'2', placeHolder:'Chapter title..', openWith: miu.makeMarkUp('*'), closeWith: miu.makeMarkDown('*')},
		{name:'=, for sections', text:'=', key:'3', placeHolder:'Section title..', closeWith: miu.makeMarkDown('=') },
		{name:'-, for subsections', text:'-', key:'4', placeHolder:'Subsection title..', closeWith: miu.makeMarkDown('-') },
		{name:'^, for subsubsections', text:'^', key:'5', placeHolder:'Subsubsection title..', closeWith: miu.makeMarkDown('^') },
		{name:'", for paragraphs', text:'"', key:'6', placeHolder:'Paragraph title..', closeWith: miu.makeMarkDown('"') },
		{name:'*, for paragraphs', text:'*', key:'7', placeHolder:'Paragraph title..', closeWith: miu.makeMarkDown('*') },
		{separator:'---------------' },		
		{name:'Bold', key:'B', openWith:'**', closeWith:'**', className: 'buttonBold'},
		{name:'Italic', key:'I', openWith:'*', closeWith:'*', className: 'buttonItalic'},
		{name:'Monospace', key:'M', openWith:'``', closeWith:'``', className: 'buttonMonospace'},
		{separator:'---------------' },
		{name: 'Indent', key: 'T', replaceWith: miu.makeIndent, className: 'buttonIndent'},
		{name: 'Remove indent', key: 'R', replaceWith: miu.removeIndent, className: 'buttonRemoveIndent'},
		{separator:'---------------' },
		{name:'Bulleted List', openWith:'- ', className: 'buttonBulletedList' },
		{name:'Numeric List', openWith:function(markItUp) {
			return markItUp.line+'. ';
		}, className: 'buttonNumericList'},
		{separator:'---------------' },
		{name:'Picture', key:'P', replaceWith:'.. image:: [![Url]!]\n', className: 'buttonPicture'},
		{name:'Link', key:'L', replaceWith: restLink, placeHolder:'Your text to link here...', className: 'buttonLink' },
		//{separator:'---------------'},	
		//{name:'Quotes', openWith:'> '},
		//{name:'Code Block / Code', openWith:'(!(\t|!|`)!)', closeWith:'(!(`)!)'},
		//{separator:'---------------'},
		//{name:'Preview', call:'preview', className:"preview"}
	]
}
