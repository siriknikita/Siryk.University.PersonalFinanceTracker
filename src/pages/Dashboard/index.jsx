import styles from "./styles.module.css";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Popup from "../../components/Popup";
import PlotStatistics from "../../components/Plot";
import ToggleDisplay from "react-toggle-display";

function Dashboard() {
    const location = useLocation();
    const email = location.state.userEmail;
    const [ user, setUser ] = useState({});
    const [ userID, setUserID ] = useState(1);
    
    // Control transaction variables
    const [ currentAmount, setCurrentAmount ] = useState(0.0);
    const [ currentCategoryID, setCurrentCategoryID ] = useState(1);
    const [ moneySpent, setMoneySpent ] = useState([]);
    const [ totalSpent, setTotalSpent ] = useState(0.00);
    const [ transactionCategories, setTransactionCategories ] = useState({});

    // Control display variables
    const [ showDashboard, setShowDashboard ] = useState(true);
    const [ isOpen, setIsOpen ] = useState(false);
    const [ transactions, setTransactions ] = useState([]);

    // Get and set user
    const getUserByEmail = async (givenEmail) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/get/user/email/${givenEmail}`);
            return await response.json();
        } catch (error) {
            console.error("Error retrieving user:", error);
        }
    };
    
    useEffect(() => {
        const fetchUser = async () => {
            const fetchedUser = await getUserByEmail(email);
            const userObj = fetchedUser.user;
            const userID = userObj.UserID;
            const totalSpent = userObj.TotalSpent;
            setUser(userObj);
            setUserID(userID);
            setTotalSpent(totalSpent);
        };
        fetchUser();
    }, [email]);

    // Get and set transaction categories
    const getTransactionCategories = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/get/transactions/categories/${userID}`);
            if (response.ok) {
                return await response.json();
            } else {
                console.error("Error retrieving transactions", await response.text());
            }
        } catch (error) {
            console.error("Error retrieving transactions:", error);
        }
    };

    useEffect(() => {
        const fetchCategories = async () => {
            const fetchedCategories = await getTransactionCategories();
            setTransactionCategories(fetchedCategories);
        };
        fetchCategories();
    }, []);

    // Get and set money spent
    const getMoneySpent = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/get/transactions/moneySpent/${userID}`);
            return await response.json();
        } catch (error) {
            console.error("Error retrieving money:", error);
        }
    };
    
    useEffect(() => {
        const fetchMoney = async () => {
            const fetchedMoney = await getMoneySpent();
            setMoneySpent(fetchedMoney);
        };
        fetchMoney();
    }, []);
    
    // Get and set transactions
    const getTransactions = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/get/transactions/${userID}`);
            console.log("Response from getting a transactions:");
            const responseObj = await response.json();
            return responseObj;
        } catch (error) {
            console.error("Error retrieving transactions:", error);
        }
    };
    
    useEffect(() => {
        const fetchTransactions = async () => {
            const fetchedTransactions = await getTransactions();
            setTransactions(fetchedTransactions);
        };
        fetchTransactions();
    }, []);

    const handlePopupSubmit = () => {
        setShowDashboard(false);
        setIsOpen(true);
    };

    const handleClose = () => {
        setShowDashboard(true);
        setIsOpen(false);
    };

    const handleAddMoneyFormSubmit = async (e) => {
        e.preventDefault();
        try {
            // fetch adding transaction route
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/add/transaction`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userID: userID,
                    currentAmount: currentAmount,
                    currentCategoryID: currentCategoryID
                }),
            });
            if (response) {
                // get category name by it's id
                const responseCategory = await fetch(`${process.env.REACT_APP_API_URL}/api/get/categoryName/${currentCategoryID}`);
                const currentCategoryObj = await responseCategory.json();
                const currentCategoryName = currentCategoryObj.categoryName;
                
                // get updated total spent variable
                const responseTotalSpent = await fetch(`${process.env.REACT_APP_API_URL}/api/get/totalSpent/${userID}`);
                const totalSpentObj = await responseTotalSpent.json();
                const updatedTotalSpent = totalSpentObj.totalSpent;

                const currentDate = new Date();
                const timestamp = currentDate.getTime();
                
                setMoneySpent([...moneySpent, currentAmount]);
                setTransactionCategories([...transactionCategories, currentCategoryName]);
                setTotalSpent(updatedTotalSpent);
                setTransactions([...transactions, {
                    TransactionID: transactions[-1].TransactionID + 1,
                    Amount: currentAmount,
                    CategoryID: currentCategoryID,
                    TransactionDate: timestamp,
                }])
                handleClose();
            } else {
                console.error("Transaction adding failed:", await response.text());
            }
        } catch (error) {
            handleClose();
            console.error("Error adding a new transaction:", error);
        }
    };

    return (
        <div className={styles.dashboard}>
            <header className={styles.menu_wrap}>
                {/* User info */}
                <figure className={styles.user}>
                    <div className={styles.user_avatar}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/>
                        </svg>
                    </div>
                    <figcaption>
                        {user.Username}
                        <br />
                        <div className={styles.user_email}>
                            {user.Email}
                        </div>
                    </figcaption>
                </figure>
                <nav>
                    {/* Tools */}
                    <section className={styles.tools}>
                        <h3>Tools</h3>
                        {/* List of tools */}
                        <ul>
                            {/* Search option */}
                            <li>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width={24}
                                    height={24}
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z" />
                                </svg>
                                Search
                            </li>
                            {/* Adding transaction option */}
                            <li>
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    className="bi bi-plus-circle"
                                    viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                </svg>
                                <button onClick={handlePopupSubmit}>Add transaction</button>
                                {/* Define a popup menu to prompt user to enter an amount of money he spent on a category */}
                                <Popup trigger={isOpen} setTrigger={setIsOpen} onClose={handleClose}>
                                    <h3>Add a new transaction!</h3>
                                    <form onSubmit={handleAddMoneyFormSubmit}>
                                        {/* Enter amount of money */}
                                        <label>
                                            Enter amount of money ($):
                                            <input 
                                                type="number"
                                                className={styles.input}
                                                placeholder="Amount"
                                                value={currentAmount}
                                                onChange={(e) => setCurrentAmount(e.target.value)}
                                                required
                                            />
                                        </label>
                                        <br />
                                        {/* Choose a category */}
                                        <label>
                                            Choose a category:
                                            <select 
                                                value={currentCategoryID}
                                                onChange={(e) => setCurrentCategoryID(e.target.value)}
                                            >
                                                <option value="1">Groceries</option>
                                                <option value="2">Utilities</option>
                                                <option value="3">Rent</option>
                                                <option value="4">Entertainment</option>
                                                <option value="5">Healthcare</option>
                                                <option value="6">Transportation</option>
                                                <option value="7">Other</option>
                                            </select>
                                        </label>
                                        <br />
                                        <br />
                                        <button className={styles.btn}>Submit</button>
                                    </form>
                                </Popup>
                            </li>
                        </ul>
                    </section>
                </nav>
            </header>
            <main className={styles.content_wrap}>
                <header className={styles.content_head}>
                    <h1>Dashboard</h1>
                </header>
                <div className={styles.content}>
                    <section className={styles.info_boxes}>
                        <div className={styles.info_box}>
                            <div className={styles.box_icon}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width={24}
                                    height={24}
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M21 20V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1zm-2-1H5V5h14v14z" />
                                    <path d="M10.381 12.309l3.172 1.586a1 1 0 0 0 1.305-.38l3-5-1.715-1.029-2.523 4.206-3.172-1.586a1.002 1.002 0 0 0-1.305.38l-3 5 1.715 1.029 2.523-4.206z" />
                                </svg>
                            </div>
                            <div className={styles.box_content}>
                                <span className={styles.big}>
                                    {totalSpent}
                                </span>
                                Money spent total ($)
                            </div>
                        </div>
                        <ToggleDisplay show={showDashboard}>
                            <PlotStatistics showDashboard={showDashboard} categories={transactionCategories} moneySpent={moneySpent} />
                        </ToggleDisplay>
                    </section>
                    <section>
                        <table>
                            <thead>
                                <tr>
                                    <th>TransactionID</th>
                                    <th>Amount</th>
                                    <th>CategoryID</th>
                                    <th>TransactionDate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* The key is required for each mapped element in React lists */}
                                {transactions.map((transaction) => (
                                    <tr key={transaction.TransactionID}> {/* Use TransactionID as the unique key */}
                                        <td>{transaction.TransactionID}</td>
                                        <td>{transaction.Amount}</td>
                                        <td>{transaction.CategoryID}</td>
                                        <td>{transaction.TransactionDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
