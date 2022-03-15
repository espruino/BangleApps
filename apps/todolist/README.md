Todo List
========

This is a simple Todo List application.  

![](screenshot2.png)

The content is loaded from a JSON file.  
You can mark a task as completed.

JSON file content example: 
```javascript
[
  {
    name: "Pro",
    children: [
      {
        name: "Read doc",
        done: true,
        children: [],
      }
    ],
  },
  {
    name: "Pers",
    children: [
      {
        name: "Grocery",
        children: [
          { name: "Milk", done: false, children: [] },
          { name: "Eggs", done: false, children: [] },
          { name: "Cheese", done: false, children: [] },
        ],
      },
      { name: "Workout", done: false, children: [] },
      { name: "Learn Rust", done: false, children: [] },
    ],
  },
]
```