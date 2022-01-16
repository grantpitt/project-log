const highlight = document.getElementById("highlight");
const plain = document.getElementById("plain");
const searchText = document.getElementById("search-text");
const highlightBox = document.getElementById("highlight-box");
const plainBox = document.getElementById("plain-box");
const art = document.getElementById("art");
const options = document.getElementById("options");
const form = document.getElementById('form');

async function onBookSeach() {
  const search = searchText.value;
  const searchResults = await searchBook(search);
  displaySearchResults(searchResults);
}

async function onBookSelect(id) {
  const book = await getBook(id);
  plain.innerText = book;
  const [punctuation, highlightText] = collectPunctuationAndHighlight(book);

  highlight.innerHTML = highlightText;
  art.innerHTML = getArtGrid(punctuation).join("");
}

async function searchBook(search) {
  const requestOptions = {
    method: "GET",
    redirect: "follow",
  };
  const params = new URLSearchParams({
    search: search,
  });
  const url = `https://gutendex.com/books?${params.toString()}`;

  const response = await fetch(url, requestOptions);
  const data = await response.json();

  return data.results;
}

function displaySearchResults(results) {
  options.textContent = "";
  results.forEach((result) => {
    const input = document.createElement("input");
    input.type = "radio";
    input.id = result.id;
    input.name = "book";
    input.value = result.id;

    const label = document.createElement("label");
    label.for = result.id;
    label.innerText = result.title;
    label.onclick = () => onBookSelect(result.id);

    options.append(input);
    options.append(label);
  });
  options.style.display = "block";
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

  return await response.text();
}

function collectPunctuationAndHighlight(bookText) {
  const punctuation = [];
  const regex = /["“’”',/*/./!?]/g;
  const highlightText = bookText.replace(regex, (match) => {
    punctuation.push(match);
    return '<span class="punct">' + match + "</span>";
  });
  return [punctuation, highlightText];
}

function getArtGrid(matches) {
  return matches.map((match) => '<div class="cell">' + match + "</div>");
}

function bindSyncScrolling(one, two) {
  let echo = false,
    sync = (one, two) => () =>
      (echo = !echo) &&
      ((one.scrollTop = two.scrollTop), (one.scrollLeft = two.scrollLeft));
  two.onscroll = sync(one, two);
  one.onscroll = sync(two, one);
}

bindSyncScrolling(highlightBox, plainBox);

form.onsubmit = (event) => {
  searchText.blur();
  onBookSeach();
  event.preventDefault();
};
