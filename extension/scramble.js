(function() {
    console.log('scramble');
    // Walk the dom, remove words, fuck with the page.  Make it look sketchy,
    // or messed up
    function textNodesUnder(el){
        var n,
            a=[],
            walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null,false);

        while(n=walk.nextNode()) a.push(n);
        return a;
    }

    text = textNodesUnder(document.body);
    text.forEach(t => {
        t.nodeValue = t.nodeValue.split('').filter(char => ['t', 'r', 's', 'a', 'i'].indexOf(char) === -1).join('');
    })
}());
