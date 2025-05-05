// Send Data to PHP in JavaScript
document.getElementById("expenseForm").addEventListener("submit", function (event) {
    event.preventDefault();
    
    let name = document.getElementById("expenseName").value;
    let description = document.getElementById("expenseDesc").value;
    let price = document.getElementById("expensePrice").value;
    let date = document.getElementById("expenseDate").value;

    fetch("add_expense.php", {
        method: "POST",
        headers: {
            "Content-Type":"application/x-www-form-urlencoded"
        },
        body: `name=${name}&description=${description}&price=${price}&date=${date}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Expense Added Successfully!");
            location.reload();
        } else {
            alert("Error Adding Expense!");
        }
    })
    .catch(error => console.error("Error:", error));
});

window.onload = function () {
    fetch("fetch_expenses.php")
        .then(response => response.json())
        .then(data => {
            const expenseList = document.getElementById("expenseList");
            expenseList.innerHTML = ""; // Clear old data

            data.forEach(exp => {
                let newRow = document.createElement("tr");
                newRow.innerHTML = `
                    <td>${exp.name}</td>
                    <td>${exp.description}</td>
                    <td>₹${parseFloat(exp.price).toFixed(2)}</td>
                    <td>${exp.date}</td>
                `;
                expenseList.appendChild(newRow);
            });
        })
        .catch(error => console.error("Error fetching expenses:", error));
};

document.addEventListener("DOMContentLoaded", () => {
    const expenseList = document.getElementById("expenseList");
    const monthlyTotal = document.getElementById("monthlyTotal");
    const memberTotal = document.getElementById("memberTotal");

    let expenses = [];

    document.getElementById("addExpense").addEventListener("click", function () {
        let name = document.getElementById("expenseName").value.trim();
        let description = document.getElementById("expenseDesc").value.trim();
        let price = parseFloat(document.getElementById("expensePrice").value);
        let date = document.getElementById("expenseDate").value;

        if (!name || !description || isNaN(price) || !date) {
            alert("Please fill in all fields!");
            return;
        }

        // Convert to Date object and extract month/year
        let expenseDate = new Date(date);
        let currentMonth = new Date().getMonth();
        let currentYear = new Date().getFullYear();

        expenses.push({ name, description, price, date });

        updateMonthlyExpense(currentMonth, currentYear);
        updateMemberExpense(currentMonth, currentYear);

        let newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${name}</td>
            <td>${description}</td>
            <td>₹${price.toFixed(2)}</td>
            <td>${date}</td>
            <td><button class="deleteBtn">Delete</button></td>
        `;

        expenseList.appendChild(newRow);

        // Delete functionality
        newRow.querySelector(".deleteBtn").addEventListener("click", function () {
            expenses = expenses.filter(exp => exp.date !== date);
            updateMonthlyExpense(currentMonth, currentYear);
            updateMemberExpense(currentMonth, currentYear);
            newRow.remove();
        });

        // Clear input fields
        document.getElementById("expenseName").value = "";
        document.getElementById("expenseDesc").value = "";
        document.getElementById("expensePrice").value = "";
        document.getElementById("expenseDate").value = "";
    });

    function updateMonthlyExpense(month, year) {
        let total = expenses
            .filter(exp => {
                let expDate = new Date(exp.date);
                return expDate.getMonth() === month && expDate.getFullYear() === year;
            })
            .reduce((sum, exp) => sum + exp.price, 0);

        monthlyTotal.textContent = `Total Monthly Expense: ₹${total.toFixed(2)}`;
    }

    function updateMemberExpense(month, year) {
        let memberExpenses = {};

        expenses.forEach(exp => {
            let expDate = new Date(exp.date);
            if (expDate.getMonth() === month && expDate.getFullYear() === year) {
                if (!memberExpenses[exp.name]) {
                    memberExpenses[exp.name] = 0;
                }
                memberExpenses[exp.name] += exp.price;
            }
        });

        memberTotal.innerHTML = "<strong>Monthly Expense per Member:</strong><br>";
        for (let member in memberExpenses) {
            memberTotal.innerHTML += `${member}: ₹${memberExpenses[member].toFixed(2)}<br>`;
        }
    }
});
