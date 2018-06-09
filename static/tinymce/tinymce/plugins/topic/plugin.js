tinymce.PluginManager.add('topic', function(editor, url) {
	var addFill = function(n) {
        if(n==1) {
            editor.insertContent(`<span class="topic_ques"> ( &nbsp; ) </span>`)
        }
        if(n==2) {
            editor.insertContent(`<span class="topic_ques"> _______ </span>`)
        }
        if(n==3) {
            editor.settings.toFormula()
        }
        if(n==4) {
            editor.settings.toFiles()
        }
	}

    editor.addButton('topic', {
        text: '内容',
        icon: false,
        type: 'menubutton',
        menu: [
            {
                text: '括号空格(  )',
                onclick: ()=> addFill(1)
            },
            {
                text: '横线空格___',
                onclick: ()=> addFill(2)
            },
            {
                text: '插入公式',
                onclick: ()=> addFill(3)
            },
            {
                text: '插入素材',
                onclick: ()=> addFill(4)
            }
        ]
    })
})