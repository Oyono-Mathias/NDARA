const checklist = [
    { scenario: "Login with valid credentials", expected: "Dashboard loads", status: "NOT TESTED" },
    { scenario: "Attempt access Admin without role", expected: "Unauthorized redirect", status: "NOT TESTED" }
];
console.log("Generated Manual Checklist:");
console.log(JSON.stringify(checklist, null, 2));
process.exit(0);
