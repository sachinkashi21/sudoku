const express = require("express");
const app = express();
const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));

function isSafe(matrix, row, col, num) {
    for (let x = 0; x < 9; x++) {
        if (matrix[row][x].value === num || matrix[x][col].value === num ||
            matrix[3 * Math.floor(row / 3) + Math.floor(x / 3)][3 * Math.floor(col / 3) + x % 3].value === num) {
            return false;
        }
    }
    return true;
}

function solveSudoku(matrix, startTime, timeLimit, depth = 0, maxDepth = 1000) {
    if (depth > maxDepth) {
        
        return false;
    }

    const currentTime = new Date().getTime();
    if (currentTime - startTime > timeLimit) {
        // console.log("Time limit exceeded");
        return false;
    }

    let empty = findEmptyLocation(matrix);
    if (!empty) {
        return true;
    }

    let row = empty[0];
    let col = empty[1];

    for (let num = 1; num <= 9; num++) {
        if (isSafe(matrix, row, col, num)) {
            matrix[row][col].value = num;
            if (solveSudoku(matrix, startTime, timeLimit, depth + 1, maxDepth)) {
                return true;
            }
            matrix[row][col].value = 0;
        }
    }
    return false;
}

function findEmptyLocation(matrix) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (matrix[row][col].value === 0) {
                return [row, col];
            }
        }
    }
    return null;
}

app.get("/sudoku", (req, res) => {
    res.render("sudoku.ejs");
});

app.get("/sudoku/new", (req, res) => {
    res.render("createSudoku.ejs");
});

app.post("/sudoku", (req, res) => {
    try {
        let mat = JSON.parse(req.body.matrix);

        let matrix = mat.map(row => row.map(value => ({
            value: value,
            wasGiven: value !== 0
        })));

        const startTime = new Date().getTime();
        const timeLimit = 10000;

        if (solveSudoku(matrix, startTime, timeLimit)) {
            res.render("solvedSudoku.ejs", { matrix });
        } else {
            res.status(400).send("No solution");
            // res.redirect("/sudoku/new");
        }
    } catch (error) {
        console.error("Error solving Sudoku:", error);

        res.redirect("/sudoku/new");
        res.status(500).send("Internal server error");
    }
});

app.post("/sudoku/play", (req, res) => {
    try {
        // console.log(req.body);
        let mat = JSON.parse(req.body.matrix);
        // console.log(mat);
        res.render("playSudoku.ejs", { matrix: JSON.stringify(mat) });
    } catch (error) {
        console.log(error);
        res.redirect("/sudoku/new");
    }
})

app.get("/", (req, res) => {
    res.send("hello");
});

app.listen(3000, () => {
    console.log("app running on port " + 3000);
});
