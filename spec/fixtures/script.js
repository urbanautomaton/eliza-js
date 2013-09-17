var script = {
  "initial":  "hello there",
  "final":    "Fine, go.",
  "quit":     ["quit"],
  "pre":      { "dont": "don't" },
  "post":     { "your": "my", "my": "your" },
  "synon":    { "desire": ["want", "need"] },
  "keys":     [
    {
    "word": "sorry",
    "weight": 1,
    "decomp": { "*": [ "Don't apologise" ] }
  },
  {
    "word": "what",
    "weight": 1,
    "decomp": { "*": [ "Does that question interest you?" ] }
  },
  {
    "word": "why",
    "weight": 2,
    "decomp": { "*": [ "goto what" ] }
  },
  {
    "word": "i",
    "weight": 1,
    "decomp": {
      "i @desire *": [
        "What makes you want (2)?",
        "Do you really (1) (2)?",
      ]
    }
  },
  {
    "word": "my",
    "weight": 3,
    "decomp": {
      "$ * my *": [
        "Earlier you mentioned your (2)"
      ]
    }
  },
  {
    "word": "like",
    "weight": 2,
    "decomp": { "I don't like *": [
      "Why do you not like (1)?",
      "You are so negative about (1)"
    ]
    }
  },
  {
    "word": "name",
    "weight": 2,
    "decomp": { "*": [ "I don't like names" ] }
  }
  ],
  "defaults": [ "Please go on" ]
};

module.exports = script;
