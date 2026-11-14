export interface CurriculumExample {
  title: string;
  language: 'html' | 'css' | 'javascript';
  code: string;
  previewHtml?: string;
  lineByLine: string[];
}

export interface CurriculumMistake {
  mistake: string;
  whyItHappens: string;
  fix: string;
}

export interface CurriculumTopic {
  order: number;
  slug: string;
  title: string;
  category: 'Web Basics' | 'HTML' | 'CSS' | 'JavaScript';
  difficulty: 'Beginner' | 'Some Basics' | 'Intermediate';
  estimatedMinutes: number;
  shortDescription: string;
  objectives: string[];
  lessonSections: {
    heading: string;
    body: string;
    analogy?: string;
  }[];
  examples: CurriculumExample[];
  commonMistakes: CurriculumMistake[];
  recap: string;
  suggestedPracticeTask: {
    title: string;
    prompt: string;
    starterCode: string;
  };
  suggestedQuizConcepts: string[];
}

export const CURRICULUM_TOPICS: CurriculumTopic[] = [
  {
    order: 1,
    slug: 'introduction-to-web-development',
    title: 'Introduction to Web Development',
    category: 'Web Basics',
    difficulty: 'Beginner',
    estimatedMinutes: 12,
    shortDescription: 'Understand what websites are, how browsers load pages, and how HTML, CSS, and JavaScript work together.',
    objectives: [
      'Explain what happens when you type a URL into a web browser.',
      'Distinguish the distinct roles of HTML, CSS, and JavaScript.',
      'Identify how a client (browser) communicates with a web server.'
    ],
    lessonSections: [
      {
        heading: 'What is a Website?',
        body: 'A website is a collection of related files (text, styles, scripts, and images) stored on a computer called a server. When you open a website, your browser asks that server for those files and turns them into the page you see on screen.',
        analogy: 'Think of a restaurant: your browser is the customer at the table, the URL is your order, and the server is the kitchen that prepares and sends the dish back to you.'
      },
      {
        heading: 'The Three Pillars: HTML, CSS, and JavaScript',
        body: 'Modern web pages are built with three core technologies working side by side. HTML defines the structure and meaning of the content. CSS controls the visual presentation like colors, fonts, and layout. JavaScript adds behavior and interactivity when users click, type, or scroll.',
        analogy: 'Imagine building a house: HTML is the brick walls and rooms (structure), CSS is the paint, lighting, and furniture arrangement (style), and JavaScript is the doorbell, switches, and smart thermostat (behavior).'
      },
      {
        heading: 'How a Browser Loads a Page',
        body: 'First, the browser resolves the domain name to an IP address and sends an HTTP request to the server. The server responds with an HTML file. As the browser reads the HTML top-to-bottom, it fetches any linked CSS and JavaScript files, builds an internal tree of elements (the DOM), applies styles, and paints pixels onto your screen.'
      }
    ],
    examples: [
      {
        title: 'How HTML, CSS, and JavaScript Cooperate',
        language: 'html',
        code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Welcome Card</title>
    <style>
      .card { padding: 16px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: sans-serif; }
      .title { color: #312e81; margin: 0 0 8px 0; }
    </style>
  </head>
  <body>
    <section class="card">
      <h1 class="title">Hello, Web Developer!</h1>
      <p id="status">Click the button to update this message.</p>
      <button id="greetBtn" type="button">Say Hi</button>
    </section>
  </body>
</html>`,
        previewHtml: `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:12px;margin:0;"><section style="padding:16px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;"><h1 style="color:#312e81;margin:0 0 8px 0;font-size:18px;">Hello, Web Developer!</h1><p style="margin:0 0 12px 0;color:#475569;font-size:14px;">HTML gives structure, CSS adds visual styling.</p><button type="button" style="padding:6px 12px;border-radius:6px;border:1px solid #4338ca;background:#4338ca;color:#fff;font-size:13px;">Say Hi</button></section></body></html>`,
        lineByLine: [
          '<!DOCTYPE html> tells the browser to use modern HTML5 rules.',
          '<style> holds CSS rules that paint the card border, spacing, and indigo heading color.',
          '<body> holds the visible HTML elements: a section, heading, paragraph, and button.',
          'Each tag has a clear semantic role rather than relying on plain unformatted text.'
        ]
      },
      {
        title: 'Adding Behavior with Safe DOM Text Updates',
        language: 'javascript',
        code: `const statusText = document.getElementById('status');
const button = document.getElementById('greetBtn');

button.addEventListener('click', () => {
  statusText.textContent = 'Welcome! You just triggered JavaScript.';
});`,
        lineByLine: [
          'document.getElementById finds the paragraph and button elements by their id attributes.',
          'addEventListener waits for a user click on the button.',
          'textContent safely updates the visible text without parsing raw HTML.'
        ]
      }
    ],
    commonMistakes: [
      {
        mistake: 'Trying to style pages using HTML tags like <center> or <font>.',
        whyItHappens: 'Older tutorials sometimes teach obsolete HTML formatting tags.',
        fix: 'Keep HTML purely for structure and meaning; put all visual styling in CSS.'
      },
      {
        mistake: 'Confusing the browser with the server.',
        whyItHappens: 'Both run code, so beginners sometimes mix up where HTML/CSS/JS execute.',
        fix: 'Remember that the browser receives HTML, CSS, and client-side JS and renders them on the user’s device.'
      }
    ],
    recap: 'Every webpage relies on a request-response trip from browser to server, using HTML for structure, CSS for design, and JavaScript for interactivity.',
    suggestedPracticeTask: {
      title: 'Identify the Roles of HTML, CSS, and JS',
      prompt: 'Explain in your own words (or give a small example) showing which parts of a simple login card belong to HTML, CSS, and JavaScript.',
      starterCode: `<!-- Identify what HTML, CSS, and JS each handle here -->\n<button>Sign In</button>`
    },
    suggestedQuizConcepts: [
      'Role of HTML vs CSS vs JavaScript',
      'Client-server request and response cycle',
      'What a web browser does when loading an HTML file'
    ]
  },
  {
    order: 2,
    slug: 'html-fundamentals',
    title: 'HTML Fundamentals',
    category: 'HTML',
    difficulty: 'Beginner',
    estimatedMinutes: 15,
    shortDescription: 'Learn HTML document structure, tags, attributes, headings, paragraphs, links, images, and lists.',
    objectives: [
      'Write a valid HTML5 document skeleton with <!DOCTYPE html>, <head>, and <body>.',
      'Use headings, paragraphs, and lists to organize readable content.',
      'Create working hyperlinks with <a> and accessible images with <img>.'
    ],
    lessonSections: [
      {
        heading: 'Tags, Elements, and Attributes',
        body: 'An HTML element usually has an opening tag like <p>, content inside, and a closing tag like </p>. Attributes live inside the opening tag as name="value" pairs to give extra details, such as href on links or alt on images.',
        analogy: 'If a tag is a shipping box, attributes are the shipping label stuck on the outside telling where it goes or what is inside.'
      },
      {
        heading: 'Document Skeleton',
        body: 'Every modern HTML page starts with <!DOCTYPE html>, wraps everything in <html lang="en">, puts page metadata (like <title> and <meta charset="UTF-8">) inside <head>, and places visible content inside <body>.'
      },
      {
        heading: 'Headings, Links, Images, and Lists',
        body: 'Use <h1> through <h6> for logical outline hierarchy (only one main <h1> per page). Use <a href="..."> for links, <img src="..." alt="..."> for images with descriptive alt text, and <ul> / <ol> with <li> for unordered or ordered lists.'
      }
    ],
    examples: [
      {
        title: 'Complete Beginner Profile Page in HTML5',
        language: 'html',
        code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Aarav's Study Notes</title>
  </head>
  <body>
    <h1>Web Development Study Plan</h1>
    <p>I am learning HTML, CSS, and JavaScript step by step.</p>
    <h2>Today's Topics</h2>
    <ul>
      <li>Document skeleton</li>
      <li>Links and accessible images</li>
    </ul>
    <p>
      Read the <a href="https://developer.mozilla.org" target="_blank" rel="noopener noreferrer">MDN Web Docs</a>.
    </p>
  </body>
</html>`,
        previewHtml: `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:12px;margin:0;color:#0f172a;"><h1 style="font-size:20px;margin:0 0 8px 0;">Web Development Study Plan</h1><p style="font-size:14px;margin:0 0 12px 0;color:#475569;">I am learning HTML, CSS, and JavaScript step by step.</p><h2 style="font-size:16px;margin:0 0 6px 0;">Today's Topics</h2><ul style="font-size:14px;margin:0 0 12px 20px;"><li>Document skeleton</li><li>Links and accessible images</li></ul><p style="font-size:14px;margin:0;">Read the <a href="#" style="color:#4338ca;">MDN Web Docs</a>.</p></body></html>`,
        lineByLine: [
          '<html lang="en"> declares English as the document language for screen readers.',
          '<h1> is the main page title; <h2> introduces a subsection.',
          '<ul> creates a bulleted list with <li> items.',
          'rel="noopener noreferrer" keeps external links with target="_blank" safe.'
        ]
      },
      {
        title: 'Accessible Image & Ordered Steps',
        language: 'html',
        code: `<figure>
  <img src="diagram.png" alt="Diagram showing HTML tags nesting inside body" width="320" height="180" />
  <figcaption>How tags nest cleanly inside one another</figcaption>
</figure>
<ol>
  <li>Open a new .html file</li>
  <li>Write the document skeleton</li>
  <li>Preview it in your browser</li>
</ol>`,
        lineByLine: [
          'alt="..." describes the image for screen readers or when the image fails to load.',
          'width and height help the browser reserve space before loading.',
          '<ol> creates a numbered list when sequence matters.'
        ]
      }
    ],
    commonMistakes: [
      {
        mistake: 'Choosing heading levels (<h1>–<h6>) based on font size instead of hierarchy.',
        whyItHappens: 'Beginners often use <h4> because <h1> looks too big.',
        fix: 'Use headings in logical outline order (h1 -> h2 -> h3) and resize them using CSS.'
      },
      {
        mistake: 'Forgetting the alt attribute on <img> elements.',
        whyItHappens: 'Images still appear visually without alt, hiding the accessibility bug.',
        fix: 'Always write concise, meaningful alt text (or alt="" for purely decorative images).'
      }
    ],
    recap: 'HTML organizes content with nested elements, semantic headings, lists, links, and accessible images inside a clean <!DOCTYPE html> skeleton.',
    suggestedPracticeTask: {
      title: 'Build a Mini Recipe Card in HTML',
      prompt: 'Write HTML for a favorite snack using an <h1> title, a short <p> description, and a <ul> list of 3 ingredients.',
      starterCode: `<!DOCTYPE html>\n<html lang="en">\n  <body>\n    <!-- Add your heading, paragraph, and ingredient list -->\n  </body>\n</html>`
    },
    suggestedQuizConcepts: [
      'Purpose of <!DOCTYPE html>, <head>, and <body>',
      'Difference between <ul> and <ol>',
      'Why the alt attribute matters on <img>',
      'Proper heading hierarchy'
    ]
  },
  {
    order: 3,
    slug: 'html-forms-and-semantic-elements',
    title: 'HTML Forms & Semantic Elements',
    category: 'HTML',
    difficulty: 'Beginner',
    estimatedMinutes: 16,
    shortDescription: 'Structure pages using semantic landmarks (<header>, <nav>, <main>, <footer>) and build accessible forms.',
    objectives: [
      'Replace generic <div> wrappers with semantic elements like <header>, <nav>, <main>, <section>, and <footer>.',
      'Connect <label> elements to <input> controls using matching for and id attributes.',
      'Use native HTML input types and validation attributes like required and minlength.'
    ],
    lessonSections: [
      {
        heading: 'Why Semantic HTML Matters',
        body: 'Semantic elements describe the meaning of the content inside them. Using <header>, <nav>, <main>, <section>, and <footer> helps screen readers jump directly to sections, improves search engine understanding, and makes code far easier for humans to maintain.',
        analogy: 'Think of labeled moving boxes ("Kitchen", "Books", "Tools") versus ten identical unlabeled brown boxes.'
      },
      {
        heading: 'Accessible Forms & Labels',
        body: 'Forms collect user input through <input>, <textarea>, <select>, and <button>. Always pair every input with a <label for="inputId"> whose for attribute matches the input id. This lets users click the label to focus the field and helps assistive technologies announce what to type.'
      },
      {
        heading: 'Built-in Validation Basics',
        body: 'HTML5 provides lightweight validation right in the browser using attributes like type="email", required, minlength="6", and placeholder. Remember that client-side validation improves UX, while real apps still validate again on the server.'
      }
    ],
    examples: [
      {
        title: 'Semantic Page Layout Landmarks',
        language: 'html',
        code: `<header>
  <a href="/">StudyHub</a>
  <nav aria-label="Main navigation">
    <a href="#lessons">Lessons</a>
    <a href="#contact">Contact</a>
  </nav>
</header>
<main>
  <section id="lessons">
    <h1>HTML Semantic Landmarks</h1>
    <p>Each landmark communicates page structure to browsers and assistive tech.</p>
  </section>
</main>
<footer>
  <p>Built with clean semantic HTML5.</p>
</footer>`,
        previewHtml: `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:12px;margin:0;color:#0f172a;"><header style="display:flex;justify-content:space-between;padding-bottom:8px;border-bottom:1px solid #e2e8f0;margin-bottom:12px;"><strong>StudyHub</strong><nav style="display:flex;gap:12px;font-size:13px;"><a href="#" style="color:#4338ca;">Lessons</a><a href="#" style="color:#4338ca;">Contact</a></nav></header><main><section><h1 style="font-size:18px;margin:0 0 6px 0;">HTML Semantic Landmarks</h1><p style="font-size:13px;color:#475569;margin:0 0 12px 0;">Each landmark communicates page structure cleanly.</p></section></main><footer style="border-top:1px solid #e2e8f0;padding-top:8px;font-size:12px;color:#64748b;">Built with clean semantic HTML5.</footer></body></html>`,
        lineByLine: [
          '<header> holds top branding and navigation.',
          '<nav aria-label="Main navigation"> marks the navigation block for screen readers.',
          '<main> contains the primary unique content of the page.',
          '<footer> holds closing notes or secondary links.'
        ]
      },
      {
        title: 'Accessible Signup Form with Native Validation',
        language: 'html',
        code: `<form action="/signup" method="post">
  <div>
    <label for="student-name">Full Name</label>
    <input id="student-name" name="name" type="text" required minlength="2" />
  </div>
  <div>
    <label for="student-email">Email Address</label>
    <input id="student-email" name="email" type="email" required />
  </div>
  <button type="submit">Create Study Plan</button>
</form>`,
        previewHtml: `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:12px;margin:0;color:#0f172a;"><form style="display:flex;flex-direction:column;gap:10px;max-width:280px;"><label style="font-size:12px;font-weight:600;">Full Name<input type="text" placeholder="Ananya" style="display:block;width:100%;margin-top:4px;padding:6px;border:1px solid #cbd5e1;border-radius:6px;box-sizing:border-box;"/></label><label style="font-size:12px;font-weight:600;">Email Address<input type="email" placeholder="ananya@example.com" style="display:block;width:100%;margin-top:4px;padding:6px;border:1px solid #cbd5e1;border-radius:6px;box-sizing:border-box;"/></label><button type="button" style="padding:8px 12px;border:none;border-radius:6px;background:#4338ca;color:#fff;font-size:13px;font-weight:600;">Create Study Plan</button></form></body></html>`,
        lineByLine: [
          'for="student-name" connects directly to id="student-name".',
          'name="email" identifies the field value when submitted.',
          'type="email" and required activate built-in browser format checks.',
          'Always specify type="submit" or type="button" explicitly on <button>.'
        ]
      }
    ],
    commonMistakes: [
      {
        mistake: 'Using placeholder text instead of a visible <label>.',
        whyItHappens: 'Placeholders disappear as soon as the user types, hurting usability and accessibility.',
        fix: 'Always provide a persistent <label for="..."> paired with the input id.'
      },
      {
        mistake: 'Wrapping everything in nested <div> tags.',
        whyItHappens: '<div> works visually, so learners skip <main>, <nav>, and <section>.',
        fix: 'Reserve <div> for styling containers and use semantic landmarks for page regions.'
      }
    ],
    recap: 'Semantic tags make page structure meaningful, while properly labeled forms with native validation attributes make user input accessible and reliable.',
    suggestedPracticeTask: {
      title: 'Create an Accessible Feedback Form',
      prompt: 'Write an HTML form inside <main> with labeled Name and Email inputs, a <button type="submit">, and required validation.',
      starterCode: `<main>\n  <form>\n    <!-- Add labeled inputs and submit button -->\n  </form>\n</main>`
    },
    suggestedQuizConcepts: [
      'Matching <label for> and <input id>',
      'Role of <main>, <header>, <nav>, <section>, and <footer>',
      'Difference between <button type="submit"> and <button type="button">',
      'HTML5 form validation attributes'
    ]
  },
  {
    order: 4,
    slug: 'css-fundamentals',
    title: 'CSS Fundamentals',
    category: 'CSS',
    difficulty: 'Beginner',
    estimatedMinutes: 16,
    shortDescription: 'Style elements with selectors, colors, typography, backgrounds, borders, units, and specificity basics.',
    objectives: [
      'Target elements accurately using element, class, and ID selectors.',
      'Style typography, colors, backgrounds, and borders consistently.',
      'Predict which CSS rule wins using the cascade and specificity.'
    ],
    lessonSections: [
      {
        heading: 'Anatomy of a CSS Rule',
        body: 'A CSS rule has a selector (who to style) and a declaration block { property: value; } (how to style it). You can target HTML tag names (p), reusable classes (.card), or unique IDs (#hero). In practice, prefer classes for reusable styling.',
        analogy: 'Selectors are like addressing mail: "all houses" (element), "all corner houses" (.class), or "house #42" (#id).'
      },
      {
        heading: 'Colors, Typography, and Units',
        body: 'Use hex (#4338ca), rgb(), or hsl() for colors. Control text readability with font-family, font-size, line-height, and font-weight. Learn key units: px for crisp borders, rem for font sizes relative to the root html font size, and % for fluid widths.'
      },
      {
        heading: 'The Cascade and Specificity',
        body: 'When two rules target the same element, CSS resolves conflicts using specificity (ID > Class > Element) and source order (if specificity ties, the later rule wins). Keeping specificity low by favoring single class selectors makes stylesheets easy to maintain.'
      }
    ],
    examples: [
      {
        title: 'Element, Class, and Typography Styling',
        language: 'css',
        code: `body {
  font-family: system-ui, sans-serif;
  color: #0f172a;
  line-height: 1.6;
}

.notice-card {
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 1rem;
}

.notice-title {
  color: #4338ca;
  font-size: 1.25rem;
  font-weight: 700;
}`,
        previewHtml: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;padding:12px;margin:0;color:#0f172a;line-height:1.6;"><div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:10px;padding:16px;"><div style="color:#4338ca;font-size:20px;font-weight:700;margin-bottom:4px;">CSS Typography & Color</div><p style="margin:0;font-size:14px;color:#475569;">Clean line-height (1.6) and subtle border contrast make cards effortless to read.</p></div></body></html>`,
        lineByLine: [
          'line-height: 1.6 adds comfortable breathing room between lines of text.',
          'rem units scale relative to the root font size, supporting browser zoom preferences.',
          'border combines width (1px), style (solid), and color (#cbd5e1).'
        ]
      },
      {
        title: 'Understanding Specificity Order',
        language: 'css',
        code: `/* Specificity: (0, 0, 1) — Element */
p { color: #64748b; }

/* Specificity: (0, 1, 0) — Class wins over element */
.highlight { color: #0284c7; }

/* Same specificity as above, later in file -> wins for .highlight.urgent */
.urgent { color: #dc2626; }`,
        lineByLine: [
          'A class selector (.highlight) overrides an element selector (p) regardless of file order.',
          'When two classes have equal specificity, the rule written later in the CSS wins.',
          'Avoid overusing !important; instead structure clean class selectors.'
        ]
      }
    ],
    commonMistakes: [
      {
        mistake: 'Forgetting the dot (.) before a class name in CSS.',
        whyItHappens: 'Writing card { ... } looks for a <card> HTML tag instead of class="card".',
        fix: 'Always prefix class selectors with a period (.card) and IDs with a hash (#main).'
      },
      {
        mistake: 'Using !important to fix every styling conflict.',
        whyItHappens: 'It feels like a quick fix when rules do not apply.',
        fix: 'Check selector spelling and specificity first so styles stay predictable.'
      }
    ],
    recap: 'CSS styles pages cleanly through selectors, readable typography, consistent units, and a predictable cascade governed by specificity.',
    suggestedPracticeTask: {
      title: 'Style an Info Banner with Classes',
      prompt: 'Write CSS rules for a .banner class with a light slate background, 1px border, rounded corners, and a .banner-heading class in deep indigo.',
      starterCode: `.banner {\n  /* Add background, border, radius, and padding */\n}\n\n.banner-heading {\n  /* Add color and font-size */\n}`
    },
    suggestedQuizConcepts: [
      'Element vs class vs ID selector syntax and specificity',
      'Difference between px and rem units',
      'How source order affects tied specificity',
      'Basic color, border, and typography properties'
    ]
  },
  {
    order: 5,
    slug: 'css-box-model-and-layout',
    title: 'CSS Box Model & Layout',
    category: 'CSS',
    difficulty: 'Some Basics',
    estimatedMinutes: 18,
    shortDescription: 'Master content, padding, border, margin, box-sizing, Flexbox for 1D alignment, and CSS Grid for 2D layouts.',
    objectives: [
      'Identify the four layers of the CSS Box Model: content, padding, border, and margin.',
      'Explain why box-sizing: border-box prevents unexpected width overflow.',
      'Arrange items in rows or columns using Flexbox and multi-column layouts using CSS Grid.'
    ],
    lessonSections: [
      {
        heading: 'The CSS Box Model',
        body: 'Every HTML element is rendered as a rectangular box made of four layers from inside out: Content (text/image), Padding (inner cushion inside the border), Border (the box edge), and Margin (outer space pushing away neighboring boxes).',
        analogy: 'Think of a framed photograph: the photo is content, the mat board around it is padding, the wooden frame is the border, and the wall gap to the next frame is margin.'
      },
      {
        heading: 'Why box-sizing: border-box Matters',
        body: 'By default (content-box), adding padding and borders increases an element’s total width beyond the width you set. Setting box-sizing: border-box tells the browser to include padding and border inside the declared width.'
      },
      {
        heading: 'Flexbox (1D) and CSS Grid (2D)',
        body: 'Use display: flex when aligning items along a single row or column (like navbars or button groups) with gap, justify-content, and align-items. Use display: grid when designing two-dimensional rows and columns together (like card galleries) with grid-template-columns and gap.'
      }
    ],
    examples: [
      {
        title: 'Flexbox Navigation Bar with Gap',
        language: 'css',
        code: `* {
  box-sizing: border-box;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  border: 1px solid #e2e8f0;
}`,
        previewHtml: `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:12px;margin:0;"><div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:12px 20px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;"><strong style="color:#0f172a;">SmartLearn</strong><div style="display:flex;gap:16px;font-size:13px;color:#475569;"><span>Learn</span><span>Practice</span><span>Quiz</span></div></div></body></html>`,
        lineByLine: [
          'box-sizing: border-box ensures padding never inflates width unexpectedly.',
          'display: flex turns direct children into flexible horizontal items.',
          'justify-content: space-between pushes brand left and links right.',
          'align-items: center vertically centers items along the cross axis.'
        ]
      },
      {
        title: 'Two-Column CSS Grid Cards',
        language: 'css',
        code: `.card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.card {
  padding: 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}`,
        previewHtml: `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:12px;margin:0;"><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;"><div style="padding:14px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;"><strong style="font-size:13px;color:#312e81;">HTML</strong><p style="margin:4px 0 0 0;font-size:12px;color:#475569;">Page structure</p></div><div style="padding:14px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;"><strong style="font-size:13px;color:#312e81;">CSS</strong><p style="margin:4px 0 0 0;font-size:12px;color:#475569;">Visual layout</p></div></div></body></html>`,
        lineByLine: [
          'grid-template-columns: repeat(2, minmax(0, 1fr)) builds two equal-width columns.',
          'gap: 16px adds clean spacing between grid cells without messy margin hacks.',
          'Padding adds inner room inside each card border.'
        ]
      }
    ],
    commonMistakes: [
      {
        mistake: 'Confusing padding and margin.',
        whyItHappens: 'Both create whitespace, so they feel interchangeable on white backgrounds.',
        fix: 'Remember padding is inside the border (and shows background color), while margin is transparent space outside the border.'
      },
      {
        mistake: 'Using floats or fixed margins for centering instead of Flexbox/Grid.',
        whyItHappens: 'Older tutorials rely on float: left and margin hacks.',
        fix: 'Use display: flex with justify-content and align-items, or display: grid with gap.'
      }
    ],
    recap: 'The Box Model governs spacing around every element, while Flexbox (1D) and CSS Grid (2D) handle modern page alignment cleanly.',
    suggestedPracticeTask: {
      title: 'Center a Three-Item Feature Row with Flexbox',
      prompt: 'Write CSS for a .features container that places three child boxes in a row with 16px gap and 20px inner padding.',
      starterCode: `.features {\n  /* Use display: flex, gap, and padding */\n}`
    },
    suggestedQuizConcepts: [
      'Order of Box Model layers (content, padding, border, margin)',
      'Effect of box-sizing: border-box',
      'Flexbox main axis vs cross axis (justify-content vs align-items)',
      'When to choose Flexbox vs CSS Grid'
    ]
  },
  {
    order: 6,
    slug: 'responsive-web-design',
    title: 'Responsive Web Design',
    category: 'CSS',
    difficulty: 'Some Basics',
    estimatedMinutes: 15,
    shortDescription: 'Adapt layouts cleanly across phones, tablets, and desktops using the viewport tag, relative units, and media queries.',
    objectives: [
      'Configure the HTML viewport meta tag so mobile browsers scale properly.',
      'Build fluid containers using relative units (%, rem, vw, max-width).',
      'Apply mobile-first @media queries and responsive image rules.'
    ],
    lessonSections: [
      {
        heading: 'What is Responsive Design?',
        body: 'People browse on 360px phones, 768px tablets, and 1440px monitors. Responsive Web Design ensures a single codebase adapts smoothly to any screen width without horizontal scrolling or tiny unreadable text.',
        analogy: 'Like water taking the shape of its container rather than a rigid brick that overflows a narrow glass.'
      },
      {
        heading: 'Viewport Meta & Mobile-First Media Queries',
        body: 'Always include <meta name="viewport" content="width=device-width, initial-scale=1.0"> in <head>. In mobile-first CSS, write single-column base styles first for narrow screens, then add @media (min-width: 768px) rules to expand into multi-column layouts on larger screens.'
      },
      {
        heading: 'Fluid Units and Responsive Images',
        body: 'Replace rigid width: 900px rules with width: 100%; max-width: 900px;. Add max-width: 100%; height: auto; to images so large photos shrink proportionally inside narrow viewports without distorting.'
      }
    ],
    examples: [
      {
        title: 'Mobile-First Two-Column Upgrade',
        language: 'css',
        code: `.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .layout {
    grid-template-columns: 2fr 1fr;
  }
}`,
        lineByLine: [
          'Default mobile layout stacks into 1 column (1fr).',
          'max-width: 1000px caps line length on large monitors while staying 100% fluid on phones.',
          'At 768px and wider, the media query switches to a 2:1 sidebar layout.'
        ]
      },
      {
        title: 'Preventing Overflow on Images',
        language: 'css',
        code: `img {
  display: block;
  max-width: 100%;
  height: auto;
}`,
        lineByLine: [
          'max-width: 100% prevents an image from stretching wider than its parent container.',
          'height: auto preserves the natural aspect ratio when shrinking.'
        ]
      }
    ],
    commonMistakes: [
      {
        mistake: 'Setting fixed pixel widths (like width: 800px) on containers.',
        whyItHappens: 'It looks fine on a laptop screen but causes horizontal scrolling on a 375px phone.',
        fix: 'Use width: 100% combined with max-width: 800px.'
      },
      {
        mistake: 'Forgetting the viewport meta tag in index.html.',
        whyItHappens: 'Mobile browsers zoom out to pretend the screen is 980px wide, breaking media queries.',
        fix: 'Keep <meta name="viewport" content="width=device-width, initial-scale=1.0"> in <head>.'
      }
    ],
    recap: 'Responsive sites combine the viewport meta tag, fluid max-width sizing, responsive images, and mobile-first @media queries.',
    suggestedPracticeTask: {
      title: 'Make a Fixed Card Container Responsive',
      prompt: 'Update a container using width: 960px so it never overflows on mobile and switches from 1 column to 3 columns at min-width: 900px.',
      starterCode: `.gallery {\n  width: 960px;\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n}`
    },
    suggestedQuizConcepts: [
      'Purpose of <meta name="viewport">',
      'Mobile-first min-width media queries',
      'Why max-width: 100% prevents horizontal overflow',
      'Relative units vs fixed px widths'
    ]
  },
  {
    order: 7,
    slug: 'javascript-fundamentals',
    title: 'JavaScript Fundamentals',
    category: 'JavaScript',
    difficulty: 'Beginner',
    estimatedMinutes: 18,
    shortDescription: 'Store and transform data using let/const variables, primitive data types, operators, strings, numbers, arrays, and console.log.',
    objectives: [
      'Declare variables properly using const by default and let when reassignment is needed.',
      'Distinguish primitive types: string, number, boolean, null, and undefined.',
      'Create and access items in arrays and inspect values with console.log.'
    ],
    lessonSections: [
      {
        heading: 'Variables: const vs let',
        body: 'Variables are labeled boxes that store data. Use const when the variable binding will not be reassigned (your default choice), and use let when its value needs to change later (like a score counter). Modern JavaScript avoids var because of confusing scoping rules.',
        analogy: 'const is like writing a name in permanent ink on a locker; let is a whiteboard label you can update as values change.'
      },
      {
        heading: 'Primitive Data Types & Operators',
        body: 'Common types include strings ("Hello"), numbers (42, 3.14), booleans (true or false), undefined (declared but not given a value), and null (intentionally empty). Use template literals (`Hello, ${name}`) to combine text and variables cleanly.'
      },
      {
        heading: 'Arrays Introduction & Console',
        body: 'An array holds an ordered list inside square brackets: const topics = ["HTML", "CSS", "JS"]. Array positions (indexes) start at 0, so topics[0] is "HTML". Use console.log(...) to inspect values while learning and debugging.'
      }
    ],
    examples: [
      {
        title: 'Variables, Template Literals, and Math',
        language: 'javascript',
        code: `const studentName = 'Riya';
let completedLessons = 2;
completedLessons = completedLessons + 1;

const isActive = true;
const summary = \`\${studentName} has completed \${completedLessons} lessons.\`;
console.log(summary, isActive);`,
        lineByLine: [
          'const studentName cannot be reassigned later.',
          'let completedLessons allows updating the count from 2 to 3.',
          'Backticks (`...`) create a template literal with ${...} placeholders.',
          'console.log prints values in the browser Developer Tools console.'
        ]
      },
      {
        title: 'Working with a Beginner Array',
        language: 'javascript',
        code: `const skills = ['HTML', 'CSS', 'JavaScript'];
console.log(skills[0]); // 'HTML'
console.log(skills.length); // 3
skills.push('DOM');
console.log(skills[3]); // 'DOM'`,
        lineByLine: [
          'Array indexing is zero-based: index 0 is the first item.',
          '.length tells you how many items are currently in the array.',
          '.push() adds a new item to the end of the array (const protects the variable binding, not array contents).'
        ]
      }
    ],
    commonMistakes: [
      {
        mistake: 'Adding a number and a string accidentally ("5" + 2 gives "52").',
        whyItHappens: 'The + operator concatenates strings when either side is a string.',
        fix: 'Keep numeric inputs as numbers (using Number(value)) before doing arithmetic.'
      },
      {
        mistake: 'Trying to access the first array item with array[1].',
        whyItHappens: 'Humans count from 1, whereas JavaScript arrays start counting at 0.',
        fix: 'Use index 0 for the first element and array.length - 1 for the last element.'
      }
    ],
    recap: 'JavaScript stores information with const/let across strings, numbers, booleans, and zero-indexed arrays, with console.log for inspection.',
    suggestedPracticeTask: {
      title: 'Calculate Total Study Minutes',
      prompt: 'Declare const variables for topicName and minutesPerDay (number), let days = 3, compute totalMinutes, and log a template literal summary.',
      starterCode: `const topicName = 'JavaScript';\nconst minutesPerDay = 25;\nlet days = 3;\n// Compute totalMinutes and console.log a summary`
    },
    suggestedQuizConcepts: [
      'When to use const vs let',
      'Primitive types: string, number, boolean, undefined, null',
      'Zero-based array indexing and .length',
      'Template literals vs string concatenation'
    ]
  },
  {
    order: 8,
    slug: 'conditions-loops-and-functions',
    title: 'Conditions, Loops & Functions',
    category: 'JavaScript',
    difficulty: 'Some Basics',
    estimatedMinutes: 20,
    shortDescription: 'Control program flow with if/else decisions, comparison/logical operators, for/while loops, and reusable functions.',
    objectives: [
      'Write branching logic with if, else if, else, ===, and logical operators (&&, ||, !).',
      'Repeat tasks cleanly using for and while loops without infinite loops.',
      'Define reusable functions with parameters and return values.'
    ],
    lessonSections: [
      {
        heading: 'Making Decisions with if / else',
        body: 'Programs make choices using boolean conditions. Always prefer strict equality (=== and !==) over loose equality (==) so JavaScript checks both value and type. Combine rules with && (AND), || (OR), and ! (NOT).',
        analogy: 'Like a train track switch: if the signal is green, take track A; else take track B.'
      },
      {
        heading: 'Repeating Actions with Loops',
        body: 'A for loop is ideal when you know how many times to repeat or when stepping through an array. A while loop repeats as long as a condition stays true—always update the condition variable inside the loop so it eventually stops.'
      },
      {
        heading: 'Reusable Functions',
        body: 'A function packages a task under a clear name. Inputs enter through parameters, and outputs leave via the return keyword. Note the difference: console.log prints to the developer console, whereas return hands a value back to the code that called the function.'
      }
    ],
    examples: [
      {
        title: 'Function with Condition & Return Value',
        language: 'javascript',
        code: `function getPassStatus(score) {
  if (score >= 80) {
    return 'Strong understanding';
  } else if (score >= 50) {
    return 'Passed, keep practicing';
  } else {
    return 'Needs review';
  }
}

const message = getPassStatus(72);
console.log(message); // 'Passed, keep practicing'`,
        lineByLine: [
          'score is the parameter receiving the input number.',
          'The if / else if / else chain checks ranges from highest to lowest.',
          'return immediately exits the function and sends the string back to the caller.'
        ]
      },
      {
        title: 'Looping Over an Array of Scores',
        language: 'javascript',
        code: `const scores = [60, 85, 90];
let total = 0;

for (let i = 0; i < scores.length; i++) {
  total = total + scores[i];
}

const average = total / scores.length;
console.log('Average:', average);`,
        lineByLine: [
          'let i = 0 starts at the first index.',
          'i < scores.length stops safely before stepping past the end of the array.',
          'total accumulates each score one pass at a time.'
        ]
      }
    ],
    commonMistakes: [
      {
        mistake: 'Using = (assignment) instead of === (comparison) inside an if condition.',
        whyItHappens: 'Single = assigns a value rather than checking equality.',
        fix: 'Use === to compare values strictly.'
      },
      {
        mistake: 'Forgetting return inside a function and getting undefined.',
        whyItHappens: 'console.log shows output in the console, making it look like the function returned something.',
        fix: 'Use return when callers need to store or reuse the computed result.'
      }
    ],
    recap: 'Conditions steer logic with === and boolean operators, loops automate repetition safely, and functions turn logic into reusable building blocks.',
    suggestedPracticeTask: {
      title: 'Write a Function to Count Passing Scores',
      prompt: 'Write a function countPassed(scores) that loops through an array of numbers and returns how many scores are >= 60.',
      starterCode: `function countPassed(scores) {\n  let passed = 0;\n  // Loop through scores and increment passed when score >= 60\n  return passed;\n}`
    },
    suggestedQuizConcepts: [
      'Strict equality (===) vs loose equality (==)',
      'Logical operators &&, ||, and !',
      'for loop structure and preventing infinite while loops',
      'Function parameters vs return values vs console.log'
    ]
  },
  {
    order: 9,
    slug: 'dom-and-interactive-websites',
    title: 'DOM & Interactive Websites',
    category: 'JavaScript',
    difficulty: 'Intermediate',
    estimatedMinutes: 20,
    shortDescription: 'Connect JavaScript to live web pages by selecting DOM elements, updating textContent safely, and handling click/input events.',
    objectives: [
      'Explain what the Document Object Model (DOM) represents.',
      'Select HTML elements with document.querySelector and update text safely with textContent.',
      'Respond to user click and input events using addEventListener.'
    ],
    lessonSections: [
      {
        heading: 'What is the DOM?',
        body: 'When a browser parses your HTML, it builds a live tree of JavaScript objects called the Document Object Model (DOM). Every heading, paragraph, button, and input becomes a node in this tree that JavaScript can inspect and update dynamically.',
        analogy: 'HTML is the architectural blueprint; the DOM is the live building whose lights and doors you can operate in real time.'
      },
      {
        heading: 'Selecting and Updating Elements Safely',
        body: 'Use document.querySelector(".my-class") or document.getElementById("my-id") to grab an element. To change what text it displays, prefer element.textContent = "New text". Avoid inserting untrusted user text with innerHTML because it can introduce Cross-Site Scripting (XSS) security bugs.'
      },
      {
        heading: 'Listening for Events',
        body: 'Interactive sites react to users via addEventListener("click", handler) or addEventListener("input", handler). Whenever the user clicks a button or types into an input box, the browser runs your callback function immediately.'
      }
    ],
    examples: [
      {
        title: 'Live Character Counter Using input Event',
        language: 'javascript',
        code: `const noteInput = document.querySelector('#noteInput');
const charCount = document.querySelector('#charCount');

noteInput.addEventListener('input', () => {
  const length = noteInput.value.length;
  charCount.textContent = \`\${length} characters typed\`;
});`,
        lineByLine: [
          'document.querySelector selects the input and counter paragraph using CSS selector syntax.',
          'The "input" event fires on every keystroke or paste.',
          'textContent updates the display safely without interpreting HTML tags.'
        ]
      },
      {
        title: 'Toggle Theme Class on Button Click',
        language: 'javascript',
        code: `const panel = document.querySelector('#studyPanel');
const toggleBtn = document.querySelector('#toggleBtn');

toggleBtn.addEventListener('click', () => {
  panel.classList.toggle('highlight');
  const isHighlighted = panel.classList.contains('highlight');
  toggleBtn.textContent = isHighlighted ? 'Reset Style' : 'Highlight Card';
});`,
        lineByLine: [
          'classList.toggle adds the CSS class if missing or removes it if present.',
          'classList.contains checks whether the class is currently active.',
          'Updating button text keeps the UI clear for all users.'
        ]
      }
    ],
    commonMistakes: [
      {
        mistake: 'Using innerHTML with user-typed values.',
        whyItHappens: 'innerHTML parses strings as HTML, allowing injected scripts or broken markup.',
        fix: 'Use textContent for text updates and document.createElement for structured DOM nodes.'
      },
      {
        mistake: 'Running document.querySelector before the HTML element exists.',
        whyItHappens: 'A <script> in <head> without defer runs before <body> is parsed, returning null.',
        fix: 'Put scripts at the bottom of <body> or add the defer attribute on <script src="..." defer>.'
      }
    ],
    recap: 'The DOM bridges HTML and JavaScript—select elements with querySelector, attach event listeners, and update text safely via textContent.',
    suggestedPracticeTask: {
      title: 'Build a Click Counter Handler',
      prompt: 'Write JavaScript that selects #incrementBtn and #countLabel, increments a count variable on click, and updates countLabel.textContent.',
      starterCode: `let count = 0;\nconst btn = document.querySelector('#incrementBtn');\nconst label = document.querySelector('#countLabel');\n// Attach click listener and update label.textContent`
    },
    suggestedQuizConcepts: [
      'What the DOM tree represents',
      'document.querySelector vs getElementById',
      'Why textContent is safer than innerHTML',
      'click and input events with addEventListener'
    ]
  }
];

export const CURRICULUM_BY_SLUG: Record<string, CurriculumTopic> = Object.fromEntries(
  CURRICULUM_TOPICS.map((t) => [t.slug, t])
);

export function isValidCurriculumSlug(slug: string): boolean {
  return slug in CURRICULUM_BY_SLUG;
}
