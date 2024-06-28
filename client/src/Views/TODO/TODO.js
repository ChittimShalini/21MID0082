import { useEffect, useState } from 'react';
import Styles from './TODO.module.css';
import axios from 'axios';

export function TODO(props) {
    const [newTodo, setNewTodo] = useState('');
    const [todoData, setTodoData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingTodo, setEditingTodo] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    useEffect(() => {
        const fetchTodo = async () => {
            const apiData = await getTodo();
            setTodoData(apiData);
            setLoading(false);
        };
        fetchTodo();
    }, []);

    const getTodo = async () => {
        const options = {
            method: "GET",
            url: `http://localhost:8000/api/todo`,
            headers: {
                accept: "application/json",
            }
        }
        try {
            const response = await axios.request(options);
            return response.data;
        } catch (err) {
            console.log(err);
            return []; // return an empty array in case of error
        }
    }

    const addTodo = () => {
        const options = {
            method: "POST",
            url: `http://localhost:8000/api/todo`,
            headers: {
                accept: "application/json",
            },
            data: {
                title: newTodo
            }
        }
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data)
                setTodoData(prevData => [...prevData, response.data.newTodo])
            })
            .catch((err) => {
                console.log(err)
            })
    }

    const deleteTodo = (id) => {
        const options = {
            method: "DELETE",
            url: `http://localhost:8000/api/todo/${id}`,
            headers: {
                accept: "application/json",
            }
        }
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data)
                setTodoData(prevData => prevData.filter(todo => todo._id !== id))
            })
            .catch((err) => {
                console.log(err)
            })
    };

    const updateTodo = (id, updates) => {
        const todoToUpdate = todoData.find(todo => todo._id === id);
        const options = {
            method: "PATCH",
            url: `http://localhost:8000/api/todo/${id}`,
            headers: {
                accept: "application/json",
            },
            data: {
                ...todoToUpdate,
                ...updates
            }
        }
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data)
                setTodoData(prevData => prevData.map(todo => todo._id === id ? response.data : todo))
            })
            .catch((err) => {
                console.log(err)
            })
    };

    const startEditing = (todo) => {
        setEditingTodo(todo._id);
        setEditTitle(todo.title);
        setEditDescription(todo.description || '');
    }

    const saveEdit = () => {
        updateTodo(editingTodo, { title: editTitle, description: editDescription });
        setEditingTodo(null);
        setEditTitle('');
        setEditDescription('');
    }

    return (
        <div className={Styles.ancestorContainer}>
            <div className={Styles.headerContainer}>
                <h1>
                    Tasks
                </h1>
                <span>
                    <input
                        className={Styles.todoInput}
                        type='text'
                        name='New Todo'
                        value={newTodo}
                        onChange={(event) => {
                            setNewTodo(event.target.value)
                        }}
                    />
                    <button
                        id='addButton'
                        name='add'
                        className={Styles.addButton}
                        onClick={() => {
                            addTodo()
                            setNewTodo('')
                        }}
                    >
                        + New Todo
                    </button>
                </span>
            </div>
            <div id='todoContainer' className={Styles.todoContainer}>
                {loading ? (
                    <p className={Styles.noTodoMessage}>Loading...</p>
                ) : (
                    todoData.length > 0 ? (
                        todoData.map((entry) => (
                            <div key={entry._id} className={Styles.todo}>
                                <div className={Styles.infoContainer}>
                                    <input
                                        type='checkbox'
                                        checked={entry.done}
                                        onChange={() => {
                                            updateTodo(entry._id, { done: !entry.done });
                                        }}
                                    />
                                    {editingTodo === entry._id ? (
                                        <div>
                                            <input
                                                type='text'
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                            />
                                            <textarea
                                                value={editDescription}
                                                onChange={(e) => setEditDescription(e.target.value)}
                                                className={Styles.editDescription}
                                            />
                                            <button onClick={saveEdit} className={Styles.saveButton}>Save</button>
                                        </div>
                                    ) : (
                                        <>
                                            <span>{entry.title}</span>
                                            <span className={Styles.description}>{entry.description}</span>
                                        </>
                                    )}
                                </div>
                                <div>
                                    <span
                                        className={Styles.editButton}
                                        onClick={() => {
                                            startEditing(entry);
                                        }}
                                    >
                                        Edit
                                    </span>
                                    <span
                                        className={Styles.deleteButton}
                                        onClick={() => {
                                            deleteTodo(entry._id);
                                        }}
                                    >
                                        Delete
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className={Styles.noTodoMessage}>No tasks available. Please add a new task.</p>
                    )
                )}
            </div>
        </div>
    )
}
