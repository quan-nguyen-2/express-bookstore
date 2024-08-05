process.env.NODE_ENV = 'test';
const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Book = require("../models/book");


let b;

beforeEach(async function () {
    await db.query("DELETE FROM books");

    b = await Book.create({
      isbn: "0691161518",
      amazon_url: "http://a.co/eobPtX2",
      author: "Test Author",
      language: "english",
      pages: 200,
      publisher: "Test Publisher",
      title: "Test Title",
      year: 2010
    });
});

describe("GET /", function(){
    test("gets all books", async function(){
        const response = await request(app).get('/books');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({"books": [{isbn: "0691161518",
                                                amazon_url: "http://a.co/eobPtX2",
                                                author: "Test Author",
                                                language: "english",
                                                pages: 200,
                                                publisher: "Test Publisher",
                                                title: "Test Title",
                                                year: 2010}]})
    })
})

describe("GET /:id", function(){
    test("gets single book", async function(){
        const resp = await request(app).get(`/books/${b.isbn}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({"book": {isbn: "0691161518",
                                                amazon_url: "http://a.co/eobPtX2",
                                                author: "Test Author",
                                                language: "english",
                                                pages: 200,
                                                publisher: "Test Publisher",
                                                title: "Test Title",
                                                year: 2010}})
    })

    test("doesn't get fake book", async function(){
        const resp = await request(app).get(`/books/boogyboogy`);
        expect(resp.statusCode).toBe(404);
    })
})

describe("POST /", function(){
    test("can create book", async function(){
        const resp = await request(app).post('/books').send({
            isbn: "1691161518",
            amazon_url: "http://a.co/eobPtX2",
            author: "Matthew Lane",
            language: "english",
            pages: 264,
            publisher: "Princeton University Press",
            title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            year: 2017
          })
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({"book": {
            isbn: "1691161518",
            amazon_url: "http://a.co/eobPtX2",
            author: "Matthew Lane",
            language: "english",
            pages: 264,
            publisher: "Princeton University Press",
            title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            year: 2017
          }})
    })

    test("can't post invalid data", async function(){
        let resp = await request(app).post('/books').send({
            isbn: "1691161518",
            amazon_url: "gfadgfadg",
            author: "Matthew Lane",
            language: "english",
            pages: -264,
            publisher: "Princeton University Press",
            title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            year: 2027
        })
        expect(resp.statusCode).toBe(400);
        resp = JSON.parse(resp.error.text)
        expect(resp.message.length).toBe(3)
    })
})

describe("PUT /:id", function(){
    test("can update book", async function(){
        let resp = await request(app).put(`/books/${b.isbn}`).send({
            isbn: `${b.isbn}`,
            amazon_url: "http://a.co/eobPtX2",
            author: "Matthew Lane",
            language: "english",
            pages: 264,
            publisher: "Princeton University Press",
            title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            year: 2017
        })
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({"book": {
            isbn: `${b.isbn}`,
            amazon_url: "http://a.co/eobPtX2",
            author: "Matthew Lane",
            language: "english",
            pages: 264,
            publisher: "Princeton University Press",
            title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            year: 2017
          }})
    })

    test("can't update invalid data", async function(){
        let resp = await request(app).put(`/books/${b.isbn}`).send({
            isbn: "1691161519",
            amazon_url: "gfadgfadg",
            author: "Matthew Lane",
            language: "english",
            pages: -264,
            publisher: "Princeton University Press",
            title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            year: 2027
        })
        expect(resp.statusCode).toBe(400);
        resp = JSON.parse(resp.error.text)
        expect(resp.message.length).toBe(3)
    })
})

describe("DELETE /:isbn", function(){
    test("deletes book", async function(){
        const resp = await request(app).delete(`/books/${b.isbn}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({ message: "Book deleted" })
    })

    test("doesn't delete fake book", async function(){
        const resp = await request(app).delete(`/books/blahblah`);
        expect(resp.statusCode).toBe(404); 
    })
})



afterAll(async function () {
    await db.end();
});
  