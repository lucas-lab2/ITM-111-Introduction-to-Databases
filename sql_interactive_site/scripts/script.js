document.addEventListener('DOMContentLoaded', () => {
    // --- Database Simulation ---
    const initialDatabaseState = {
        school: {
            students: [
                { id: 1, name: 'Ana Smith', email: 'ana.smith@email.com', age: 20 },
                { id: 2, name: 'Beatriz Costa', email: 'bia.costa@email.com', age: 22 },
                { id: 3, name: 'John Mendes', email: 'john.mendes@email.com', age: 19 },
            ]
        }
    };
    let database = JSON.parse(JSON.stringify(initialDatabaseState));
    let nextId = 4;
    
    // --- Tutorial Structure ---
    const lessons = [
        {
            title: "Lesson 1: Viewing All Data",
            explanation: "Welcome to the SQL tutorial! Let's start with the most basic command: `SELECT`. To see everything (*) from a table, we use `SELECT * FROM table_name;`. Our table is called `students`.",
            task: "Your task: Type `SELECT * FROM students;` and press Enter.",
            expectedQuery: "select * from students;",
            successMessage: "Excellent! You've fetched all the data from the `students` table. See the result above. Let's move to the next lesson."
        },
        {
            title: "Lesson 2: Selecting Specific Columns",
            explanation: "Often, we don't want all the columns. To select specific columns, just list them instead of using `*`.",
            task: "Your task: Select only the `name` and `email` from the students.",
            expectedQuery: "select name, email from students;",
            successMessage: "Perfect! Now you know how to select specific columns. This is very useful for creating clean reports."
        },
        {
            title: "Lesson 3: Filtering Data with `WHERE`",
            explanation: "The `WHERE` clause is used to filter records. It works like an `if` statement. Let's find only the students who are older than 20.",
            task: "Your task: Type `SELECT * FROM students WHERE age > 20;`",
            expectedQuery: "select * from students where age > 20;",
            successMessage: "Great! You've successfully filtered the data. The `WHERE` clause is one of the most powerful tools in SQL."
        },
        {
            title: "Lesson 4: Using `=` in `WHERE`",
            explanation: "We can use the equals sign (`=`) to find exact values. Remember to put text (strings) in single quotes ''.",
            task: "Your task: Find the student whose name is 'Ana Smith'.",
            expectedQuery: "select * from students where name = 'ana smith';",
            successMessage: "That's right! Finding specific records is a very common task."
        },
        {
            title: "Lesson 5: Inserting New Data with `INSERT INTO`",
            explanation: "Now let's add data! We use `INSERT INTO table_name (column1, column2) VALUES (value1, value2);`.",
            task: "Your task: Insert a new student named 'Carlos Lima', with email 'carlos@email.com' and age 23.",
            expectedQuery: "insert into students (name, email, age) values ('carlos lima', 'carlos@email.com', 23);",
            successMessage: "Fantastic! You've added a new student. To confirm, you can run `SELECT * FROM students;` again (but it's not necessary to advance)."
        },
        {
            title: "End of Tutorial",
            explanation: "Congratulations! You have completed the basic SQL tutorial. You've learned how to select, filter, and insert data. You now have a solid foundation to continue exploring the world of SQL!",
            task: "Type `reset` to start over or continue practicing the commands freely.",
            expectedQuery: null,
        }
    ];
    let currentLessonIndex = 0;

    // --- DOM Elements ---
    const sqlInput = document.getElementById('sql-input');
    const terminalOutput = document.getElementById('terminal-output');

    // --- Terminal Functions ---
    function printToTerminal(htmlContent, className = '') {
        const div = document.createElement('div');
        div.className = `mt-2 ${className}`;
        div.innerHTML = htmlContent;
        terminalOutput.appendChild(div);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
    
    function printError(message) {
        printToTerminal(`<p class="text-red-400">Error: ${message}</p>`);
    }

    function loadLesson(index) {
        const lesson = lessons[index];
        printToTerminal(`<strong>--- ${lesson.title} ---</strong>`, 'tutorial-text');
        printToTerminal(lesson.explanation, 'tutorial-text');
        printToTerminal(lesson.task, 'task-text');
    }

    function resetTutorial() {
        terminalOutput.innerHTML = '';
        database = JSON.parse(JSON.stringify(initialDatabaseState));
        nextId = 4;
        currentLessonIndex = 0;
        loadLesson(0);
    }
    
    function renderTable(dataArray) {
        if (dataArray.length === 0) {
            printToTerminal('<p class="text-yellow-400">Query executed successfully. No results found.</p>');
            return;
        }
        const headers = Object.keys(dataArray[0]);
        let tableHtml = '<table class="w-full text-left text-slate-300 query-result-table mt-2 border-collapse">';
        tableHtml += '<thead><tr>';
        headers.forEach(h => tableHtml += `<th>${h}</th>`);
        tableHtml += '</tr></thead><tbody>';

        dataArray.forEach(row => {
            tableHtml += '<tr>';
            headers.forEach(h => tableHtml += `<td>${row[h] === null ? 'NULL' : row[h]}</td>`);
            tableHtml += '</tr>';
        });

        tableHtml += '</tbody></table>';
        printToTerminal(tableHtml);
    }

    function executeUserCommand(query) {
        const cleanQuery = query.trim().toLowerCase().replace(/;$/, '');
        const lesson = lessons[currentLessonIndex];

        printToTerminal(`<span class="text-gray-500">&gt; ${query}</span>`);

        // Tutorial commands
        if (cleanQuery === 'reset') {
            resetTutorial();
            return;
        }
        if (cleanQuery === 'help') {
            printToTerminal("Tutorial commands: `reset` (restarts the tutorial).", "command-text");
            return;
        }

        // Lesson validation
        if (lesson.expectedQuery && cleanQuery === lesson.expectedQuery.replace(/;$/, '')) {
            executeSql(lesson.expectedQuery);
            printToTerminal(lesson.successMessage, 'command-text');
            currentLessonIndex++;
            if (currentLessonIndex < lessons.length) {
                loadLesson(currentLessonIndex);
            }
        } else {
            // Allow free execution, but provide feedback
            if(lesson.expectedQuery) {
                printError(`This command might be correct, but to advance the lesson, please use the exact command from the task.`);
            }
            executeSql(query); // Pass original query
        }
    }

    function executeSql(query) {
        try {
            const normalizedQuery = query.toLowerCase().trim();
            if (normalizedQuery.startsWith('select')) { handleSelect(normalizedQuery); } 
            else if (normalizedQuery.startsWith('insert')) { handleInsert(query); } // Pass original query for case-sensitive values
            else if (normalizedQuery.startsWith('update')) { handleUpdate(normalizedQuery); } 
            else if (normalizedQuery.startsWith('delete')) { handleDelete(normalizedQuery); } 
            else if (normalizedQuery.startsWith('create table')) { printToTerminal(`<p class="text-green-400">Command 'CREATE TABLE' received. In a real system, the table would have been created.</p>`);}
            else { printError('SQL command not recognized or not supported in this simulation.'); }
        } catch (e) {
            printError(`An error occurred while processing your query: ${e.message}. Check the syntax.`);
        }
    }

    // --- SQL Handling Logic ---
    function handleSelect(query) {
        const fromMatch = /from\s+students/i.exec(query);
        if (!fromMatch) { printError("Invalid syntax. Expected 'FROM students'."); return; }
        let data = [...database.school.students];
        const whereMatch = /where\s+(.*);?/i.exec(query);
        if (whereMatch) { data = filterData(data, whereMatch[1]); }
        const selectClause = query.substring(query.indexOf('select') + 6, query.indexOf('from')).trim();
        if (selectClause !== '*') {
            const columns = selectClause.split(',').map(c => c.trim());
            data = data.map(row => {
                let newRow = {};
                columns.forEach(col => { if (row.hasOwnProperty(col)) newRow[col] = row[col]; });
                return newRow;
            });
        }
        renderTable(data);
    }

    function handleInsert(query) {
        const valuesMatch = /values\s*\((.*)\);?/i.exec(query);
        if (!valuesMatch) { printError("Invalid INSERT syntax."); return; }
        const values = valuesMatch[1].split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''));
        
        const columnsMatch = /insert into students\s*\(([^)]+)\)/i.exec(query);
        if (!columnsMatch || values.length !== columnsMatch[1].split(',').length) {
             printError("Invalid INSERT. Column count does not match value count."); return;
        }

        const newRecord = { id: nextId++ };
        const columns = columnsMatch[1].split(',').map(c => c.trim());
        columns.forEach((col, index) => {
            let value = values[index];
            newRecord[col] = col === 'age' ? parseInt(value, 10) : value;
        });

        database.school.students.push(newRecord);
        printToTerminal('<p class="text-green-400">1 row inserted successfully.</p>');
    }
    
    function handleUpdate(query) { printToTerminal('<p class="text-yellow-400">The UPDATE command is valid, but it is not part of the guided tutorial.</p>');}
    function handleDelete(query) { printToTerminal('<p class="text-yellow-400">The DELETE command is valid, but it is not part of the guided tutorial.</p>');}

    function filterData(data, condition) {
        const conditionLower = condition.toLowerCase().replace(/;$/, '');
        // Filter by equality (e.g., name = 'ana smith')
        let parts = conditionLower.split('=').map(p => p.trim().replace(/['"]/g, ''));
        if (parts.length === 2) {
            const key = parts[0];
            let value = parts[1];
            return data.filter(row => String(row[key]).toLowerCase() == value);
        }
        // Filter by greater than (e.g., age > 20)
        parts = condition.split('>').map(p => p.trim());
        if (parts.length === 2) {
             const key = parts[0];
             const value = parseInt(parts[1], 10);
             return data.filter(row => row[key] > value);
        }
        return []; // Return empty if condition is not supported
    }

    // --- Event Listeners ---
    sqlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && sqlInput.value.trim() !== '') {
            executeUserCommand(sqlInput.value);
            sqlInput.value = '';
        }
    });

    // --- Tab Logic ---
    const tabButtons = {
        concepts: document.getElementById('tab-btn-concepts'),
        select: document.getElementById('tab-btn-select'),
        where: document.getElementById('tab-btn-where'),
        dml: document.getElementById('tab-btn-dml'),
        ddl: document.getElementById('tab-btn-ddl'),
    };

    const tabPanels = {
        concepts: document.getElementById('concepts'),
        select: document.getElementById('select'),
        where: document.getElementById('where'),
        dml: document.getElementById('dml'),
        ddl: document.getElementById('ddl'),
    };

    function changeTab(tabId) {
        // Hide all panels and remove active class from all buttons
        Object.values(tabPanels).forEach(panel => panel.classList.add('hidden'));
        Object.values(tabButtons).forEach(button => button.classList.remove('active'));
        
        // Show the selected panel and set the corresponding button to active
        tabPanels[tabId].classList.remove('hidden');
        tabButtons[tabId].classList.add('active');
    }

    tabButtons.concepts.addEventListener('click', () => changeTab('concepts'));
    tabButtons.select.addEventListener('click', () => changeTab('select'));
    tabButtons.where.addEventListener('click', () => changeTab('where'));
    tabButtons.dml.addEventListener('click', () => changeTab('dml'));
    tabButtons.ddl.addEventListener('click', () => changeTab('ddl'));

    // --- Start Tutorial ---
    loadLesson(currentLessonIndex);
});
