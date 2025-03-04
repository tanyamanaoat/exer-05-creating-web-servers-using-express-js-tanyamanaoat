// Import required modules
const express = require('express'); // To create the web server
const fs = require('fs'); // For file system operations
const app = express(); // To initialize Express
const port = 3000; // Port where the server runs

// Middleware to parse JSON request bodies
app.use(express.json());

/*
POST /add-book
Adds a new book to books.txt
✔️ Checks if all fields are provided and ISBN is unique.
✔️ Appends the book in the format: bookName,isbn,author,yearPublished
✔️ Responds with { success: true } if saved. Otherwise, { success: false }
*/
app.post('/add-book', (req, res) => {
  const { bookName, isbn, author, yearPublished } = req.body;

  // Check if all fields are filled
  if (!bookName || !isbn || !author || !yearPublished) {
    console.log('> { success: false }');
    return res.json({ success: false });
  }

  // Check if ISBN already exists in books.txt
  if (fs.existsSync('books.txt')) {
    const data = fs.readFileSync('books.txt', 'utf8');
    if (data.includes(isbn)) {
      console.log('> { success: false }');
      return res.json({ success: false });
    }
  }

  // Prepare book entry
  const bookEntry = `${bookName},${isbn},${author},${yearPublished}\n`;

  // Append book to books.txt
  fs.appendFile('books.txt', bookEntry, (err) => {
    if (err) {
      console.log('> { success: false }');
      return res.json({ success: false });
    }
    console.log('> { success: true }');
    res.json({ success: true });
  });
});

/*
GET /find-by-isbn-author
Finds a single book matching both ISBN and author.
✔️ Searches books.txt for a matching line.
✔️ Responds with the book details if found.
✔️ Responds with { success: false } if not found or on error.
*/
app.get('/find-by-isbn-author', (req, res) => {
  const { isbn, author } = req.query;

  fs.readFile('books.txt', 'utf8', (err, data) => {
    if (err) return res.json({ success: false });

    const books = data.trim().split('\n');
    const foundBook = books.find(line => {
      const [bookName, bookIsbn, bookAuthor, yearPublished] = line.split(',');
      return bookIsbn === isbn && bookAuthor === author;
    });

    if (foundBook) {
      const [bookName, bookIsbn, bookAuthor, yearPublished] = foundBook.split(',');
      res.json({
        bookName,
        isbn: bookIsbn,
        author: bookAuthor,
        yearPublished
      });
    } else {
      res.json({ success: false });
    }
  });
});

/*
GET /find-by-author
Finds all books written by the given author.
✔️ Searches books.txt for all books by the author.
✔️ Responds with an array of books if found.
✔️ Responds with { success: false } if no books are found or on error.
*/
app.get('/find-by-author', (req, res) => {
  const { author } = req.query;

  fs.readFile('books.txt', 'utf8', (err, data) => {
    if (err) return res.json({ success: false });

    const books = data.trim().split('\n');
    const foundBooks = books.filter(line => {
      const [bookName, bookIsbn, bookAuthor, yearPublished] = line.split(',');
      return bookAuthor === author;
    });

    if (foundBooks.length > 0) {
      const result = foundBooks.map(book => {
        const [bookName, bookIsbn, bookAuthor, yearPublished] = book.split(',');
        return { bookName, isbn: bookIsbn, author: bookAuthor, yearPublished };
      });
      res.json(result);
    } else {
      res.json({ success: false });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});