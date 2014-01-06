# eliza.js

eliza.js is a Javascript clone of ELIZA, Joseph Weizenbaum's [simulation
of a Rogerian psychotherapist](http://en.wikipedia.org/wiki/ELIZA). It
is an attempt to properly learn javascript, so don't blame me if it's
godawful.

## Explanation

ELIZA was one of the very first chatterbots, an early attempt to use
natural language processing to emulate human responses. Programattically
it's really very simple, and the majority of the "intelligence" is
embodied in the script.

Charles Hayden has an excellent [explanation and sample
script](chayden.net/eliza/instructions.txt) on his website; this is what
I used as a reference.

Loosely speaking, an input phrase is broken down into tokens, and a set
of weighted keywords is searched for in the token list. Each keyword has
an associated set of match patterns ("decompositions") and responses
which are tried in turn against the input phrase. If one matches, the
response is constructed (sometimes using captured segments of the input
phrase) and returned. If none match, then the system moves on to the
next decomposition, and the next keyword, until a match is found.

Some decompositions store their response for later, giving ELIZA the
appearance of returning to earlier topics. Others redirect to specific
keywords.

## Usage

An Eliza object requires a client implementing the `.say()` and
`.quit()` methods, and a script of fiendish complexity (see
`lib/eliza/script.js` for the more-or-less original ELIZA script as
translated into a bodgy JSON representation).

Call `.say()` on the Eliza instance, and it will call `.say()` right
back with some gibberish. If you utter one of the quit phrases as
specified in the script, Eliza will call the client's `.quit()` method.

```javascript
var script = {
  // ...
}

var client = {
  say: function(phrase) { console.log(phrase); },
  quit: function(phrase) { console.log("QUIT"); }
};

var eliza = new Eliza(client, script);

eliza.say("hello");
// => client.say() called with some response
```

I had a stab at implementing this using a strictly tell-don't-ask style,
mainly to appease Tom Stuart (the evil one). It actually worked out
quite nicely I think, the sequence diagram looks mostly like this:

![Eliza sequence
diagram](http://screenshots.urbanautomaton.com/20130917_vo44m.png)

As far as I can tell there's only one place where one type of object
gets and sets properties on another type, and that's in the `LinkedList`
implementation (it's not clear in the diagram above: each key has a
linked list of decomps. The key calls `.match()` on the first decomp,
which passes on to the next decomp unless it can find a match).

Most of the grossness is in `Eliza` itself, most of the responsibilities
of which would be handled by a proper script parser if I had any pride.
