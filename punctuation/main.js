const highlight = document.getElementById("highlight");
const plain = document.getElementById("plain");
const searchText = document.getElementById("search-text");
const highlightBox = document.getElementById("highlight-box");
const plainBox = document.getElementById("plain-box");
const art = document.getElementById("art");
const options = document.getElementById("options");
const form = document.getElementById('form');

async function main() {
  const requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  const params = new URLSearchParams({
    search: searchText.value,
  });

  const url = `https://gutendex.com/books?${params.toString()}`;

  const response = await fetch(url, requestOptions);
  const data = await response.json();

  const results = data.results;

  options.textContent = "";
  for (let result of results) {
    const input = document.createElement("input");
    input.type = "radio";
    input.id = result.id;
    input.name = "book"
    input.value = result.id;
    
    const label = document.createElement("label");
    label.for = result.id;
    label.innerText = result.title;
    label.onclick = () => getBook(result.id)
    
    options.append(input);
    options.append(label);
  }
  options.style.display = "block"
}

async function getBook(id) {
  options.style.display = "none";

  const response = await fetch(
    `https://gutenberg.p.rapidapi.com/cache/epub/${id}/pg${id}.txt`,
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": "gutenberg.p.rapidapi.com",
        "x-rapidapi-key": "9d5a2bd30dmsh31171dca4a199dcp1efb64jsnf930e2f5f58f",
      },
    }
  );

  const bookText = await response.text();

  plain.innerText = bookText;

  const regex = /["“’”',/*/./!?]/g;

  const matches = [];

  const punctuation = bookText.replace(regex, (match) => {
    matches.push(match);
    return '<span class="punct">' + match + "</span>";
  });
  highlight.innerHTML = punctuation;
  artGrid = matches.map(match => '<div class="cell">' + match + "</div>")
  art.innerHTML = artGrid.join("");
}

bindSyncScrolling(highlightBox, plainBox);

function bindSyncScrolling(one, two) {
  let echo = false,
    sync = (one, two) => () =>
      (echo = !echo) &&
      ((one.scrollTop = two.scrollTop), (one.scrollLeft = two.scrollLeft));
  two.onscroll = sync(one, two);
  one.onscroll = sync(two, one);
}

form.onsubmit = (event) => {
  searchText.blur();
  main();
  event.preventDefault();
};
