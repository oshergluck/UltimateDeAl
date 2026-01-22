import React, { useState, useEffect } from 'react';
import { useStateContext } from '../context';
import { Loader, CustomButton, SalesDashboard } from '../components';
import { Base } from "@thirdweb-dev/chains";
import { ethers } from 'ethers';
import { ContractOwner, useContract } from '@thirdweb-dev/react';
import { fontSizes } from '../components/AccessibilityMenu';
import { Bar, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { createThirdwebClient, prepareContractCall, getContract } from "thirdweb";
import { useSendTransaction, TransactionButton, useActiveAccount } from 'thirdweb/react';
import { format, addDays } from 'date-fns';
import { PinataSDK } from "pinata";
import { useNavigate } from 'react-router-dom';


const ClientAdminPage = () => {
    function normAddr(a) {
        return String(a || '').trim().toLowerCase();
      }
    const account = useActiveAccount();

const [adminToken, setAdminToken] = useState(() => localStorage.getItem("ADMIN_TOKEN") || "");

  

    const navigate = useNavigate();
    const adminLogin = async (userContract) => {
        try {
        SettingAContract(userContract)
          if (!account?.address) return alert("Connect wallet first");
          if (!userContract) return alert("Enter valid store contract (0x...)");
      
          // 1) challenge
          const chRes = await fetch(`${API_URL}/admin/challenge`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              walletAddress: account.address,
              storeAddress: userContract,
              chainId: 8453,
            }),
          });
      
          const ch = await chRes.json().catch(() => ({}));
          if (!chRes.ok || !ch?.success) throw new Error(ch?.error || "Challenge failed");
      
          // 2) sign message
          const ts = Date.now();
          const msg = [
            "UltraShop Admin Login",
            `Domain: ${window.location.origin}`,
            `Wallet: ${String(normAddr(account.address))}`,
            `Store: ${String(normAddr(userContract))}`,
            `Timestamp: ${ts}`,
            `Nonce: ${ch.nonce}`,
            "ChainId: 8453",
          ].join("\n");
      
          const signature = await account.signMessage({ message: msg,chainId:8453 });
      
          // 3) login verify -> token
          const lgRes = await fetch(`${API_URL}/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              walletAddress: account.address,
              storeAddress: userContract,
              signature,
              timestamp: ts,
              nonce: ch.nonce,
              chainId: 8453,
            }),
          });
      
          const lg = await lgRes.json().catch(() => ({}));
          if (!lgRes.ok || !lg?.success || !lg?.token) throw new Error(lg?.error || "Login failed");
      
          localStorage.setItem("ADMIN_TOKEN", lg.token);
          setAdminToken(lg.token);
      
          // עכשיו תתחבר ללוגיקה שלך של החוזה + receipts וכו'
          await SettingAContract(userContract);
        } catch (e) {
          console.error(e);
          alert(e?.message || "Admin login error");
        }
      };

      const adminLogout = () => {
        localStorage.removeItem("ADMIN_TOKEN");
        setAdminToken("");
        setConnectedto(false);
      };
      
      const authFetch = async (path, body = {}) => {
        const token = adminToken || localStorage.getItem("ADMIN_TOKEN");
        if (!token) throw new Error("Not logged in (missing admin token)");
      
        const res = await fetch(`${API_URL}${path}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data?.success === false) {
          const msg = data?.error || data?.message || `HTTP ${res.status}`;
          throw new Error(msg);
        }
        return data;
      };
      
    // Product Images Upload State
    const [isUploadingImages, setIsUploadingImages] = useState([false]);
    const [imageUploadProgress, setImageUploadProgress] = useState([0]);

    // Hidden Media Upload State
    const [isUploadingHidden, setIsUploadingHidden] = useState(false);
    const [hiddenUploadProgress, setHiddenUploadProgress] = useState(0);

    const pinata = new PinataSDK({
        pinataJwt: import.meta.env.VITE_PINATA_JWT,
        pinataGateway: "bronze-sticky-guanaco-654.mypinata.cloud",
    });

    const client = createThirdwebClient({ clientId: import.meta.env.VITE_THIRDWEB_CLIENT })
    const { mutate: sendTransaction, isPending } = useSendTransaction();
    const [userPass, setUserPass] = useState('');
    const ThirdWEBAPI = import.meta.env.VITE_THIRDWEB_CLIENT;
    const POLYRPC = `https://8453.rpc.thirdweb.com/${ThirdWEBAPI}`
    const POLYRPC1 = 'https://base-mainnet.g.alchemy.com/v2/d32cys2ito51Xt9AgfAUTBuIuQd-yQbm';
    const defaultFontSizeIndex = fontSizes.indexOf('sm');
    const defaultSize = fontSizes[defaultFontSizeIndex - 2];
    
    // Form States
    const [amountForPayment, setAmountForPayment] = useState('');
    const [setstoring, setsetstoring] = useState('');
    const [distId, setDistId] = useState('');
    const [workerAddress, setWorkerAddress] = useState('');
    const [workerIndex, setWorkerIndex] = useState('');
    const [productName, setProductName] = useState('');
    const [dividend, setDividend] = useState('');
    const [maxCall, setMaxCall] = useState('');
    const [indexOfReceipt, setIndexOfReceipt] = useState('');
    const [productBarcode, setProductBarcode] = useState('');
    const [produtQuantity, setProdutQuantity] = useState('');
    const [productPrice, setProductPrice] = useState();
    const [productDiscount, setProductDiscount] = useState('');
    const [images, setImages] = useState(["", ""]);
    const [contractOwner, setContractOwner] = useState('');
    const [showImageInputs, setShowImageInputs] = useState(true);
    const [productDescription, setProductDescription] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [nameofworker, setNameOfWorker] = useState('');
    const [email, setEmail] = useState('');
    
    const [AmountForDeposit, setAmountForDeposit] = useState('');
    const [newOwner, setNewOwner] = useState('');
    const [amount, setAmount] = useState('');
    const [userContract, setUserContract] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [responseData, setResponseData] = useState('');
    const [contractPassword, setcontractPassword] = useState('');
    const { approveCoinsForSmartContractDeAl, address, storeRegistery, encryptIPFS, encrypt, decrypt, HexToInteger, generateKey, formatDate, generateSecretKey, ethAddressToBinaryKey } = useStateContext();
    const [connectedto, setConnectedto] = useState(false);
    const [productCategory, setProductCategory] = useState('');
    const [receipts, setReceipts] = useState([]);
    const [hiddenIPFS, setHiddenIPFS] = useState(''); // Stores the CID after upload
    const [type, setType] = useState('');
    const [inv, setInvoices] = useState();
    const [invoicesaddress, setinvoiceaddress] = useState('');
    const { contract: contract } = useContract(userContract);
    
    const API_URL = import.meta.env.VITE_MONGO_SERVER_API + "/api";;

    const [adminContract, setAdminContract] = useState(null);

    async function getInvoices(data) {
        const data2 = await contract.call('invoices');
        console.log(data);
        setinvoiceaddress(data);
        const theData = getContract({
            client: client,
            chain: {
                id: 8453,
                rpc: POLYRPC,
            },
            address: data
        });
        setInvoices(theData);
    }

    useEffect(() => {
        if (adminToken && userContract && ethers.utils.isAddress(userContract)) {
          setConnectedto(true);
        }
      }, [adminToken, userContract]);

    useEffect(() => {
        if (userContract && ethers.utils.isAddress(userContract)) {
            const contract = getContract({
                client: client,
                chain: {
                    id: 8453,
                    rpc: POLYRPC,
                },
                address: userContract,
            });

            setAdminContract(contract);
            getInvoices();

        } else {
            setAdminContract(null);
        }
    }, [userContract]);

    const PaymentContract = getContract({
        client: client,
        chain: {
            id: 8453,
            rpc: POLYRPC,
        },
        address: import.meta.env.VITE_DEAL_COIN_ADDRESS,
    });

    useEffect(() => {
        window.scrollTo(0, 0);
        const recognizeType = async () => {
            if (contract) {
                const data = await contract.call('typeOfContract');
                setType(data);
                const data2 = await contract.call('invoices');
                getInvoices(data2);
                setInvoices(data2);
                const data1 = await contract.call('contractOwner');
                setContractOwner(data1);
            }
        };
        recognizeType();
    }, [contract]);

    function renderDescriptionWithBreaks(description) {
        if (!description) return <p>No description provided.</p>;

        const processText = (text) => {
            const sanitizedText = text.replace(/[\s\uFEFF\xA0]+/g, ' ');
            const nodes = [];
            let currentText = '';
            let styles = [];

            for (let i = 0; i < sanitizedText.length; i++) {
                const char = sanitizedText[i];

                if (char === '~' || char === '*' || char === '^' || char === '$') {
                    if (currentText) {
                        nodes.push({ text: currentText, styles: [...styles] });
                        currentText = '';
                    }
                    const styleIndex = styles.indexOf(char);
                    if (styleIndex > -1) {
                        styles.splice(styleIndex, 1);
                    } else {
                        styles.push(char);
                    }
                    continue;
                }

                currentText += char;
            }

            if (currentText) {
                nodes.push({ text: currentText, styles: [...styles] });
            }

            return nodes.map((node, index) => {
                let element = <span key={index}>{node.text}</span>;

                node.styles.forEach(style => {
                    const defaultFontSizeIndex = fontSizes.indexOf('sm');
                    const defaultSize = fontSizes[defaultFontSizeIndex - 7];

                    switch (style) {
                        case '~':
                            element = <span key={index} className={`!text-[#FFDD00] text-${defaultSize}`}>{element}</span>;
                            break;
                        case '*':
                            element = <strong key={index} className={`text-${defaultSize}`}>{element}</strong>;
                            break;
                        case '$':
                            element = <span key={index} className={`text-center block my-[10px] text-${defaultSize}`}>{element}</span>;
                            break;
                        case '^':
                            const fontSizeIndex = fontSizes.indexOf('sm') + 2;
                            const size = fontSizes[fontSizeIndex];
                            element = <span key={index} className={`text-${size}`}>{element}</span>;
                            break;
                        default:
                            element = <span key={index} className={`text-${defaultSize}`}>{element}</span>;
                            break;
                    }
                });

                return element;
            });
        };

        const lines = description.split('\n').map((line, index) => (
            <div key={index} className="whitespace-pre-wrap">
                {processText(line)}
            </div>
        ));

        return (
            <div className="font-epilogue text-[#FFFFFF]">
                {lines}
            </div>
        );
    }

    const SettingAContract = async (userContract) => {
        setIsLoading(true);

        const waitWithTimeout = (checkFn, timeout = 8000) => {
            return Promise.race([
                new Promise(resolve => {
                    const check = setInterval(() => {
                        if (checkFn()) {
                            clearInterval(check);
                            resolve();
                        }
                    }, 100);
                }),
                new Promise((_, reject) =>
                    setTimeout(() => {
                        reject(new Error('Timeout'));
                    }, timeout)
                )
            ]);
        };

        try {
            await waitWithTimeout(() => adminContract);
            await waitWithTimeout(() => contract);

            await waitWithTimeout(() => getAllReceipts());
            await waitWithTimeout(() => inv);

            setConnectedto(true);
        } catch (error) {
            alert('Contract setup timeout: Try again', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (index, value) => {
        setImages(prevImages => {
            const newImages = [...prevImages];
            newImages[index] = value;
            return newImages;
        });
    };

    const clearResponseData = () => {
        setResponseData('');
    };

    const setAprrovalAmount = async () => {
        setAmount(amount * 1e6);
        try {
            const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
            const gasPrice = await provider.getGasPrice();

            await approveCoinsForSmartContractDeAl(AmountForDeposit * 1e6, userContract);
        }
        catch (error) {
            alert(error);
        }
    };

    const handleAddWorker = async () => {
        try {
            await setcontractPassword(contractPassword);
            const encryptedName = encrypt(nameofworker, address, userContract);
            const encryptedEmail = encrypt(email, contractPassword, address, userContract);
            setIsLoading(true);
            const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
            const gasPrice = await provider.getGasPrice();

            const transaction = prepareContractCall({
                contract: adminContract,
                method: "function addWorker(string memory _email,address _walletAddress,string memory _name)",
                params: [encryptedEmail, workerAddress, encryptedName],
                value: 0,
                gasPrice: gasPrice,
            });
            sendTransaction(transaction);

            setIsLoading(false);
            return true;
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    const handlePayForWorker = async () => {
        try {
            setIsLoading(true);
            const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
            const gasPrice = await provider.getGasPrice();

            const transaction = prepareContractCall({
                contract: adminContract,
                method: "function payForWorker(uint256 _amountInNormalNumber, uint256 _indexOfWorker)",
                params: [amountForPayment, workerIndex],
                value: 0,
                gasPrice: gasPrice,
            });
            sendTransaction(transaction);

            setIsLoading(false);
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    const handleProfit = async () => {
        try {
            setIsLoading(true);
            const data = await contract.call('Balance');
            setResponseData("Profit Balance: ~" + HexToInteger(data._hex) / 1e6 + ' USDC~');
            setIsLoading(false);
            return data;
        } catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    const handleTotal = async () => {
        try {
            setIsLoading(true);
            const data = await contract.call('total');
            setResponseData("Total Deposited From Creation: ~" + HexToInteger(data._hex) / 1e6 + '~ USDC');
            setIsLoading(false);
            return data;
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    const handleGetPaymentsOfWorker = async () => {
        try {
            setIsLoading(true);
            clearResponseData();
            const data = await contract.call('getWorkerPayments', [workerIndex]);
            const totalPayments = data.length;
            const formattedPayments = data.map((payment, index) => {
                const reversedIndex = totalPayments - index - 1;
                return `${reversedIndex.toString().padStart(2, '0')}: ${ethers.BigNumber.from(payment)} USDC`;
            });

            await setResponseData(`Worker ${workerIndex} Payments:\n${formattedPayments.join('\n')}`);
            setIsLoading(false);
            return formattedPayments;
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    const addProduct = async () => {
        try {
            setIsLoading(true);
            const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
            const gasPrice = await provider.getGasPrice();
            const imagesArray = await images.filter(img => img !== '');
            const transaction = prepareContractCall({
                contract: adminContract,
                method: "function addProduct(string _name, string _barcode, uint256 _priceInNormalNumber, uint256 _quantity, string[] _productImages, string _productDescription, uint256 _discountPercentage)",
                params: [productName, productBarcode, productPrice, produtQuantity, imagesArray, productDescription, productDiscount],
                value: 0,
                gasPrice: gasPrice,
            });
            sendTransaction(transaction);

            setIsLoading(false);
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    const editProduct = async () => {
        try {
            setIsLoading(true);
            const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
            const gasPrice = await provider.getGasPrice();
            const imagesArray = await images.filter(img => img !== '');

            const transaction = prepareContractCall({
                contract: adminContract,
                method: "function editProduct(string _barcode, string _name, uint256 _priceInNormalNumber, string[] _productImages, string _productDescription)",
                params: [productBarcode, productName, productPrice, imagesArray, productDescription],
                value: 0,
                gasPrice: gasPrice,
            });
            sendTransaction(transaction);

            setIsLoading(false);
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    const updateProductQuantity = async () => {
        try {
            setIsLoading(true);
            const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
            const gasPrice = await provider.getGasPrice();

            const transaction = prepareContractCall({
                contract: adminContract,
                method: "function updateProductQuantity(string memory _barcode, uint256 _newQuantity)",
                params: [productBarcode, produtQuantity],
                value: 0,
                gasPrice: gasPrice,
            });
            sendTransaction(transaction);


            setIsLoading(false);
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    const changeProductDiscount = async () => {
        try {
            setIsLoading(true);
            const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
            const gasPrice = await provider.getGasPrice();


            const transaction = prepareContractCall({
                contract: adminContract,
                method: "function changeProductDiscount(string memory _barcode, uint256 _newDiscountPercentage)",
                params: [productBarcode, productDiscount],
                value: 0,
                gasPrice: gasPrice,
            });
            sendTransaction(transaction);

            setIsLoading(false);
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };


    const getAllReceipts = async () => {
        try {
            setIsLoading(true);
            clearResponseData();

            const receipts = await contract.call('getAllReceipts');
            setReceipts(receipts);
            const totalReceipts = receipts.length;

            const formattedReceipts = receipts.map((receipt, index) => {
                const decryptedReceipt = [
                    `Invoice Id ` + receipt[0],
                    formatDate(receipt[1] * 1000),
                    receipt[2],
                    receipt[5],
                    receipt[6] / 1e6,
                ];

                const reversedIndex = totalReceipts - index - 1;
                return `${decryptedReceipt.join(', ')}`;
            });

            const formattedString = formattedReceipts.join('~\n\n~');

            setResponseData(`All Invoices:\n~${formattedString}~`);
            setIsLoading(false);
            return formattedReceipts;
        } catch (error) {
            alert(`Error retrieving receipts: ${error.message}`);
            setIsLoading(false);
        }
    };

    const LoadProduct = async (barcode) => {
        setIsLoading(true);
        try {
            const data = await contract.call('products', [barcode]);
            const images = await contract.call('getProductPics', [barcode]);
            const formattedData = await {
                name: data[0],
                barcode: data[1],
                price: data[2],
                quantity: data[3],
                description: data[4],
                discount: data[5],
                category: data[6],
                images: images
            };
            setProductCategory(formattedData.category);
            setProductDiscount(formattedData.discount);
            setProductDescription(formattedData.description);
            setProductName(formattedData.name);
            setProductPrice(formattedData.price * 1e-6);
            setProdutQuantity(formattedData.quantity);
            console.log('CIDs: ' + formattedData.images);
            setImages(formattedData.images);
            setIsLoading(false);
        }
        catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    }



    const getReceipt = async () => {
        try {
            setIsLoading(true);
            clearResponseData();
            setcontractPassword('');
    
            console.log("🔍 Fetching invoice ID:", indexOfReceipt);
    
            // 1. שליפת מידע מהחוזה (Blockchain - האמת המוחלטת לקיום העסקה)
            const receiptData = await contract.call('receipts', [indexOfReceipt]);
            const extraData = await contract.call('infos', [indexOfReceipt]);
            const ownerAddress = await contract.call('contractOwner');
    
            // 2. בדיקת בעלות
            const currentAddressLower = normAddr(address); 
            const ownerAddressLower = normAddr(ownerAddress);
            const isOwner = currentAddressLower === ownerAddressLower;
            setContractOwner(ownerAddress);
    
            // שליפת כתובת הלקוח מהחוזה
            const clientWallet = receiptData[2]; 
            console.log("💳 Client Wallet from Contract:", clientWallet);
    
            // 3. הגדרת משתנה לקוח כברירת מחדל
            let client = { 
                name: "Unknown (Not in DB)", 
                email: "Unknown", 
                phone: "Unknown", 
                physicalAddress: "Unknown" 
            };
    
            // 4. ניסיון לשליפת ההזמנה מהשרת (שימוש ב-Order Snapshot)
            try {
                const token = localStorage.getItem("ADMIN_TOKEN");
                if (token) {
                    // שינוי: קריאה ל-get-order במקום get-client-details
                    const response = await fetch(`${API_URL}/store/get-order`, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}` 
                        },
                        body: JSON.stringify({ receiptId: indexOfReceipt }) 
                    });
    
                    const dbData = await response.json();
                    console.log("📡 Server Order Response:", dbData);
    
                    if (dbData.success && dbData.order) {
                        // בדיקה אם יש Snapshot (הזמנות חדשות)
                        if (dbData.order.clientSnapshot) {
                            client = {
                                name: dbData.order.clientSnapshot.name || "Unknown",
                                email: dbData.order.clientSnapshot.email || "Unknown",
                                phone: dbData.order.clientSnapshot.phone || "Unknown",
                                physicalAddress: dbData.order.clientSnapshot.physicalAddress || "Unknown"
                            };
                            console.log("✅ Client details loaded from Order Snapshot (Safe from deletion)");
                        } 
                        // תמיכה לאחור בהזמנות ישנות שאולי אין להן סנאפשוט
                        else if (dbData.order.clientAddress) {
                             console.warn("⚠️ Old order without snapshot, client details might be missing if deleted.");
                        }
                    } else {
                        console.warn("⚠️ Order not found in DB (might be an old manual transaction):", dbData.error);
                    }
                } else {
                    console.warn("⚠️ No ADMIN_TOKEN found in localStorage");
                }
            } catch (err) {
                console.error("❌ Failed to fetch order details:", err);
            }
    
            // 5. המרת סכומים
            const amountPaidFormatted = ethers.utils 
                ? ethers.utils.formatUnits(receiptData[4], 6) 
                : ethers.formatUnits(receiptData[4], 6);
    
            // 6. בניית האובייקט לתצוגה
            const formattedData = {
                rId: receiptData[0],
                time: receiptData[1],
                wallet: clientWallet,
                name: client.name,
                email: client.email,
                productBarcode: receiptData[3],
                amountPaid: amountPaidFormatted,
                physicalAddress: client.physicalAddress,
                phone: client.phone,
            };
    
            // 7. בניית המחרוזת לתצוגה
            if (formattedData) {
                const sensitiveData = isOwner 
                    ? `\nName: ~${formattedData.name}~\nEmail: ~${formattedData.email}~\nAddress: ~${formattedData.physicalAddress}~\nPhone: ~${formattedData.phone}~\n${extraData}`
                    : `\nName: [Hidden]\nEmail: You are not the contractOwner!\nAddress: [Hidden]\nPhone: [Hidden]`;
    
                setResponseData(
                    `Receipt ID: ~${formattedData.rId}~` +
                    `\nTime: ~${formatDate(formattedData.time * 1000)}~` +
                    `\nWallet: ~${formattedData.wallet}~` +
                    `\nProduct Barcode: ~${formattedData.productBarcode}~` +
                    `\nAmount Paid: ~${formattedData.amountPaid} USDC~` +
                    sensitiveData
                );
            }
    
            setIsLoading(false);
            return formattedData;
    
        } catch (error) {
            console.error("❌ Critical Error in getReceipt:", error);
            alert(error.message || "An error occurred fetching the receipt");
            setIsLoading(false);
        }
    };

    const getAllDecryptedEmails = async () => {
        try {
          setIsLoading(true);
          setResponseData("");
      
          const result = await authFetch("/store/get-all-clients", {});
          const clients = result.clients || [];
      
          if (!clients.length) {
            setResponseData("No clients registered for this store yet.");
            return;
          }
      
          const formattedList = clients.map((c, i) =>
            `${i + 1}. Name: ~${c.name}~\n   Email: ~${c.email}~\n   Phone: ${c.phone}\n   Wallet: ${c.walletAddress}`
          ).join("\n\n-------------------\n\n");
      
          setResponseData(`Found ${clients.length} Clients:\n\n${formattedList}`);
        } catch (e) {
          console.error(e);
          alert(e?.message || "Failed to fetch client list");
        } finally {
          setIsLoading(false);
        }
      };
      
      const getReceiptsByAddress = async () => {
        try {
            setIsLoading(true);
            clearResponseData();
            setCustomerAddress(customerAddress);
    
            const token = localStorage.getItem("ADMIN_TOKEN");
            if (!token) throw new Error("Admin not logged in (missing token)");
    
            // 1) שליפת הזמנות מהשרת (כולל Snapshot אם קיים)
            const ordersResponse = await fetch(`${API_URL}/store/get-client-orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    clientAddress: customerAddress,
                }),
            });
    
            const ordersData = await ordersResponse.json().catch(() => ({}));
            if (!ordersResponse.ok || !ordersData?.success) {
                throw new Error(ordersData?.error || ordersData?.message || "Failed to fetch orders");
            }
    
            const dbOrders = ordersData.orders || [];
    
            // 2) שליפת פרטי לקוח חיים (גיבוי להזמנות ישנות)
            const clientResponse = await fetch(`${API_URL}/store/get-client-details`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    clientAddress: customerAddress,
                }),
            });
    
            const dbClientData = await clientResponse.json().catch(() => ({}));
            const liveClient = dbClientData?.success ? dbClientData.data : null;
    
            let formattedReceipts = "";
            
            // שליפת ה-Owner פעם אחת מחוץ ללולאה
            const contractOwnerAddress = await contract.call("contractOwner");
            const isOwner = address && contractOwnerAddress && address.toLowerCase() === contractOwnerAddress.toLowerCase();
    
            for (let i = 0; i < dbOrders.length; i++) {
                const order = dbOrders[i];
    
                // --- בחירת מקור המידע (Snapshot או Live) ---
                let displayClient = { 
                    name: "Unknown", 
                    email: "Unknown", 
                    phone: "Unknown", 
                    physicalAddress: "Unknown" 
                };
    
                if (order.clientSnapshot && order.clientSnapshot.name) {
                    displayClient = order.clientSnapshot;
                } else if (liveClient) {
                    displayClient = liveClient;
                }
    
                // --- שליפת מידע נוסף (Infos) ספציפית להזמנה הזו ---
                let specificMoreData = "";
                try {
                    // הגנה: בודקים שה-ID הוא מספר הגיוני (קטן מ-100 מיליון) כדי לא לשלוח כתובות לחוזה
                    if (order.receiptId < 100000000) {
                        specificMoreData = await contract.call("infos", [order.receiptId]);
                    } else {
                        specificMoreData = "Invalid Receipt ID (Data Error)";
                    }
                } catch (err) {
                    console.log(`Failed to fetch infos for receipt ${order.receiptId}`, err);
                }
    
                // --- בניית התצוגה ---
                formattedReceipts += `\n\n\nReceipt ID: ${order.receiptId}
          Time: ${formatDate(order.timestamp * 1000)}
          Wallet: ${order.clientAddress}
          Name: ${isOwner ? displayClient.name : "Hidden (Not Owner)"}
          Email: ${isOwner ? displayClient.email : "Hidden (Not Owner)"}
          Product Barcode: ${order.productBarcode}
          Amount Payed: ~${order.price} USDC~
          Address: ${isOwner ? displayClient.physicalAddress : "Hidden (Not Owner)"}
          More info: ${specificMoreData}
          Phone: ${isOwner ? displayClient.phone : "Hidden (Not Owner)"}
          Status: ${order.isRefunded ? "~REFUNDED~" : "Completed"}\n\n\n\n\n`;
            }
    
            if (formattedReceipts === "") {
                formattedReceipts = "No orders found for this address.";
            }
    
            setResponseData(formattedReceipts);
            setIsLoading(false);
        } catch (error) {
            alert(error.message);
            setIsLoading(false);
        }
    };

    const getClientDetails = async (clientAddress) => {
        try {
          setIsLoading(true);
          setResponseData("");
      
          const result = await authFetch("/store/get-client-details", {
            clientAddress: clientAddress,
          });
      
          const c = result.data;
      
          setResponseData(`
      Name: ~${c.name}~
      Email: ~${c.email}~
      Phone: ~${c.phone}~
      Address: ~${c.physicalAddress}~
      Wallet: ~${c.wallet}~
          `);
        } catch (e) {
          console.error(e);
          alert(e?.message || "Connection Error");
        } finally {
          setIsLoading(false);
        }
      };
      

    const handleDepostMoney = async () => {
        try {
            setIsLoading(true);
            const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
            const gasPrice = await provider.getGasPrice();

            const transaction = prepareContractCall({
                contract: adminContract,
                method: "function deposit(uint256 _amount)",
                params: [AmountForDeposit * 1e6],
                value: 0,
                gasPrice: gasPrice,
            });
            sendTransaction(transaction);

            setIsLoading(false);
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    const handleChangeOwner = async () => {
        try {
            setIsLoading(true);
            const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
            const gasPrice = await provider.getGasPrice();

            const transaction = prepareContractCall({
                contract: adminContract,
                method: "function changeOwner(address _newOwner) returns (bool)",
                params: [newOwner],
                value: 0,
                gasPrice: gasPrice,
            });
            sendTransaction(transaction);

            setIsLoading(false);
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    const handleDistributeProfit = async () => {
        try {
            setIsLoading(true);
            const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
            const gasPrice = await provider.getGasPrice();
            if (dividend == '') {
                alert('Must Put a number in Dividend Precentage\nIf you dont want to share dividends put 0');
                setIsLoading(false);
                return;
            }
            const transaction = await prepareContractCall({
                contract: adminContract,
                method: "function distributeQuarterlyBalance(uint256 percentageToDistribute, uint256 maxCalls) returns (bool)",
                params: [dividend, maxCall],
                value: 0,
                gasPrice: gasPrice,
            });
            sendTransaction(transaction);
            setIsLoading(false);
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    const handleContinueDistributeProfit = async () => {
        try {
            setIsLoading(true);
            const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
            const gasPrice = await provider.getGasPrice();
            const transaction = await prepareContractCall({
                contract: adminContract,
                method: "function continueDistribution(bytes32 distributionId, uint256 maxCalls) returns (bool)",
                params: [distId, maxCall],
                value: 0,
                gasPrice: gasPrice,
            });
            sendTransaction(transaction);
            setIsLoading(false);
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    const FInalyz = async () => {
        try {
            setIsLoading(true);
            const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
            const gasPrice = await provider.getGasPrice();
            const transaction = await prepareContractCall({
                contract: adminContract,
                method: "function finalizeDistribution(bytes32 distributionId) nonReentrant onlyOwner public returns(bool)",
                params: [distId],
                value: 0,
                gasPrice: gasPrice,
            });
            sendTransaction(transaction);
            setIsLoading(false);
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    const handlePayment = async () => {
        try {
            setIsLoading(true);
            const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
            const gasPrice = await provider.getGasPrice();
            const transaction = prepareContractCall({
                contract: adminContract,
                method: "function payWorkerAfterFeeFromStoreBalance(address worker, uint256 amount) returns (bool)",
                params: [workerAddress, amountForPayment * 1e6],
                value: 0,
                gasPrice: gasPrice,
            });
            sendTransaction(transaction);
            setIsLoading(false);
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (index, file) => {
        if (!file) return;

        const newUploadingStates = [...isUploadingImages];
        const newProgressStates = [...imageUploadProgress];

        newUploadingStates[index] = true;
        newProgressStates[index] = 0;

        setIsUploadingImages(newUploadingStates);
        setImageUploadProgress(newProgressStates);

        try {
            const upload = await pinata.upload.file(file, {
                onProgress: (progress) => {
                    const percent = Math.round((progress.bytes / progress.totalBytes) * 100);
                    newProgressStates[index] = percent;
                    setImageUploadProgress([...newProgressStates]);
                }
            });

            const newImages = [...images];
            newImages[index] = upload.IpfsHash;
            setImages(newImages);

            console.log(`Image ${index + 1} uploaded to IPFS:`, upload.IpfsHash);
        } catch (error) {
            console.error(`Error uploading image ${index + 1}:`, error);
            alert(`Failed to upload image ${index + 1}. Please try again.`);
        } finally {
            newUploadingStates[index] = false;
            newProgressStates[index] = 0;
            setIsUploadingImages(newUploadingStates);
            setImageUploadProgress(newProgressStates);
        }
    };

    const handleRemoveImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
    };

    const handleAddImage = () => {
        setImages([...images, '']);
    };


    const HandleRefund = async (addressOfClient, ReceiptID) => {
        try {
            setIsLoading(true);
            const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
            const gasPrice = await provider.getGasPrice();

            const transaction = prepareContractCall({
                contract: adminContract,
                method: "function refundClient(address _client, uint256 _receiptId)",
                params: [addressOfClient, ReceiptID],
                value: 0,
                gasPrice: gasPrice,
            });
            sendTransaction(transaction);


            setIsLoading(false);
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    // --- New Function: Upload Hidden Content (File to Pinata -> DB) ---
    const handleHiddenMediaUpload = async (file) => {
        if (!file) return;
        setIsUploadingHidden(true);
        setHiddenUploadProgress(0);

        try {
            const upload = await pinata.upload.file(file, {
                onProgress: (progress) => {
                    const percent = Math.round((progress.bytes / progress.totalBytes) * 100);
                    setHiddenUploadProgress(percent);
                }
            });
            setHiddenIPFS(upload.IpfsHash);
            console.log("Hidden media uploaded to IPFS:", upload.IpfsHash);
        } catch (error) {
            console.error("Hidden upload error:", error);
            alert("Failed to upload file to IPFS");
        } finally {
            setIsUploadingHidden(false);
        }
    };

    const handleRemoveHiddenMedia = () => {
        setHiddenIPFS('');
        setHiddenUploadProgress(0);
    };

    // --- Upload Hidden Content Record to Database ---
    const handleUploadHiddenContent = async () => {
        if (!userContract) {
            alert("Please login first.");
            return;
        }
        if (!productBarcode || !hiddenIPFS) {
            alert("Please enter Product Barcode and upload a file first.");
            return;
        }

        try {
            setIsLoading(true);

            const data = await authFetch("/store/upload-hidden-content", {
                productBarcode,
                ipfsHash: hiddenIPFS,
              });
              

            if (data.success) {
                alert("Hidden content linked successfully in Database!");
                // Clear inputs after success
                setHiddenIPFS('');
                setHiddenUploadProgress(0);
            } else {
                alert("Error: " + data.error);
            }

        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to link content in DB");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Edit Hidden Content (Upsert in DB) ---
    const handleEditHiddenContent = async () => {
        await handleUploadHiddenContent();
    };


    const convertBigNumber = (bigNumberObj) => {
        return bigNumberObj.toNumber();
    };

    const handleGetWorker = async () => {
        try {
            setIsLoading(true);
            clearResponseData();
            setcontractPassword('');
            const data = await contract.call('workers', [workerIndex]);
            const formattedData = await {
                email: await decrypt(data[0], contractPassword),
                address: data[1],
                name: await decrypt(data[2], contractPassword),
                index: convertBigNumber(data[3])
            };
            await setResponseData(String('Email: ' + formattedData.email + ' Wallet: ' + formattedData.address + ' Name: ' + formattedData.name + ' Index: ' + formattedData.index));
            setIsLoading(false);
            return formattedData;
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen text-gray-100 p-2 sm:p-4 md:p-6">
            <div className="max-w-7xl mx-auto bg-slate-800/50 rounded-xl shadow-2xl backdrop-blur-sm border border-slate-700 overflow-hidden">
                {isLoading && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                        <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-t-4 border-yellow-500"></div>
                    </div>
                )}

                {/* Header */}
                <header className="p-4 sm:p-6 border-b border-slate-700">
                    <h1 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent mb-2">
                        Company Administration Dashboard
                    </h1>
                </header>

               

                {/* Status Banners */}
                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                    <div className="p-3 sm:p-4 rounded-lg bg-yellow-500/90 text-black font-medium shadow-md">
                        <div className="flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm sm:text-base">Press once on every button. Transactions may take up to 30 seconds to process.</p>
                        </div>
                    </div>

                    <div className="p-3 sm:p-4 rounded-lg bg-slate-700 shadow-md border border-slate-600">
                        <div className="flex flex-wrap gap-3 sm:gap-4 text-sm">
                            <div className="flex items-center">
                                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-yellow-500 mr-2"></div>
                                <span>Gas Required</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500 mr-2"></div>
                                <span>Free Operation</span>
                            </div>
                        </div>
                    </div>
                </div>

                {connectedto && adminToken  ? (
                    <div className="p-3 sm:p-4">
                        {receipts ? (
                            <div className="space-y-4 sm:space-y-6">
                                <SalesDashboard receipts={receipts} style={'mx-auto'} />
                                <div className="bg-slate-800 rounded-lg shadow-md p-3 sm:p-4 border border-slate-700">
                                    <h2 className="text-lg sm:text-xl font-semibold mb-2 text-yellow-400">Response Data</h2>
                                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-yellow-400 p-3 sm:p-4 rounded-lg border border-slate-700 min-h-[40px] text-xs sm:text-sm overflow-auto max-h-[150px] sm:max-h-[200px]">
                                        {renderDescriptionWithBreaks(responseData)}
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {/* Main Dashboard Section */}
                        <div className="space-y-6 sm:space-y-8 mt-4 sm:mt-6">
                            {/* Invoice Management Section */}
                            <section className="bg-slate-800 rounded-lg shadow-md p-4 sm:p-5 border border-slate-700">
                                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-yellow-400 border-b border-slate-700 pb-2">Invoice Management</h2>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                    <button onClick={getAllReceipts} className="px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors duration-200 text-xs sm:text-sm">
                                        Get All Invoices
                                    </button>
                                    <button onClick={getAllDecryptedEmails} className="px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors duration-200 text-xs sm:text-sm">
                                        Get All Emails
                                    </button>

                                    <input type="number" placeholder="Invoice ID" value={indexOfReceipt} onChange={e => setIndexOfReceipt(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
                                    <button onClick={getReceipt} className="px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors duration-200 text-xs sm:text-sm">
                                        Get Invoice By ID
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                    <input type="text" placeholder="Customer Wallet" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
                                    <button onClick={getReceiptsByAddress} className="px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors duration-200 text-xs sm:text-sm">
                                        Get Client Invoices
                                    </button>
                                    <button onClick={() => HandleRefund(customerAddress, indexOfReceipt)} className="px-3 sm:px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-200 text-xs sm:text-sm">
                                        Refund By Invoice ID
                                    </button>
                                </div>

                                <button onClick={() => getClientDetails(customerAddress)} className="px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors duration-200 text-xs sm:text-sm">
                                    Get Client Details
                                </button>
                            </section>
                            {/* Financial Operations Section */}
                            <section className="bg-slate-800 rounded-lg shadow-md p-4 sm:p-5 border border-slate-700">
                                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-yellow-400 border-b border-slate-700 pb-2">Financial Operations</h2>

                                {/* Profit and Dividends */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                                    <div className="space-y-3">
                                        <h3 className="text-base sm:text-lg font-medium text-gray-200">Profit Distribution</h3>
                                        <div className="flex gap-2">
                                            <button onClick={handleDistributeProfit} className="flex-1 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-200 flex items-center justify-center text-sm sm:text-base">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                                </svg>
                                                <span className="hidden sm:inline">Distribute</span> Dividends
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="text" placeholder="Dividend %" value={dividend} onChange={e => setDividend(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
                                            <input type="text" placeholder="Max Calls" value={maxCall} onChange={e => setMaxCall(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
                                        </div>
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="Dist. ID" value={distId} onChange={e => setDistId(e.target.value)} className="flex-1 p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-xs sm:text-sm" />
                                            <div>
                                                <TransactionButton
                                                    className={"!flex-1 !px-2 !sm:px-4 !py-2 !bg-yellow-500 !hover:bg-yellow-600 !text-black !font-medium !rounded-lg !transition-colors !duration-200 !text-xs !sm:text-sm"}
                                                    transaction={async () => {
                                                        const tx = prepareContractCall({
                                                            contract: adminContract,
                                                            method: "function continueDistribution(bytes32 distributionId, uint256 maxCalls) returns (bool)",
                                                            params: [distId, maxCall],
                                                        });
                                                        return tx;
                                                    }}
                                                    onTransactionSent={(result) => {
                                                        console.log("Transaction submitted", result.transactionHash);
                                                    }}
                                                    onTransactionConfirmed={(receipt) => {
                                                        console.log("Transaction confirmed", receipt.transactionHash);
                                                    }}
                                                    onError={(error) => {
                                                        console.error("Transaction error", error);
                                                    }}
                                                >
                                                    Continue Distribution
                                                </TransactionButton>
                                            </div>

                                        </div>
                                        <div>
                                            <TransactionButton
                                                className={"!px-2 !sm:px-4 !py-2 !bg-yellow-500 !hover:bg-yellow-600 !text-black !font-medium !rounded-lg !transition-colors !duration-200 !text-xs !sm:text-sm"}
                                                transaction={async () => {
                                                    const tx = prepareContractCall({
                                                        contract: adminContract,
                                                        method: "function finalizeDistribution(bytes32 distributionId) public returns(bool)",
                                                        params: [distId],
                                                    });
                                                    return tx;
                                                }}
                                                onTransactionSent={(result) => {
                                                    console.log("Transaction submitted", result.transactionHash);
                                                }}
                                                onTransactionConfirmed={(receipt) => {
                                                    console.log("Transaction confirmed", receipt.transactionHash);
                                                }}
                                                onError={(error) => {
                                                    console.error("Transaction error", error);
                                                }}
                                            >
                                                Finish Distribution
                                            </TransactionButton>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-base sm:text-lg font-medium text-gray-200">Profit Status</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button onClick={handleProfit} className="px-2 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors duration-200 text-xs sm:text-sm">
                                                Contract Profit
                                            </button>
                                            <button onClick={handleTotal} className="px-2 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors duration-200 text-xs sm:text-sm">
                                                Total Profit
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Direct Payment */}
                                <div className="bg-slate-700/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                                    <h3 className="text-base sm:text-lg font-medium mb-2 text-gray-200">Direct Payment</h3>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input type="text" placeholder="Wallet Address" value={workerAddress} onChange={e => setWorkerAddress(e.target.value)} className="flex-1 p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
                                        <input type="number" placeholder="Amount" value={amountForPayment} onChange={e => setAmountForPayment(e.target.value)} className="flex-1 p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
                                        <button onClick={handlePayment} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-200 whitespace-nowrap text-sm sm:text-base">
                                            Pay To
                                        </button>
                                    </div>
                                </div>

                                {/* USDC Operations */}
                                <div className="bg-slate-700/50 rounded-lg p-3 sm:p-4">
                                    <h3 className="text-base sm:text-lg font-medium mb-2 text-gray-200">USDC Operations</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                                        <input type="number" placeholder="Amount For Deposit" value={AmountForDeposit} onChange={e => setAmountForDeposit(e.target.value)} className="sm:col-span-2 p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
                                        <TransactionButton
                                            className={"!px-3 !sm:px-4 !py-2 !bg-yellow-500 !hover:bg-yellow-600 !text-black !font-medium !rounded-lg !transition-colors !duration-200 !text-sm"}
                                            transaction={async () => {
                                                const tx = prepareContractCall({
                                                    contract: adminContract,
                                                    method: "function deposit(uint256 _amount)",
                                                    params: [AmountForDeposit * 1e6]
                                                });
                                                return tx;
                                            }}
                                            onTransactionSent={(result) => {
                                                console.log("Transaction submitted", result.transactionHash);
                                            }}
                                            onTransactionConfirmed={(receipt) => {
                                                console.log("Transaction confirmed", receipt.transactionHash);
                                            }}
                                            onError={(error) => {
                                                console.error("Transaction error", error);
                                            }}
                                        >
                                            Deposit USDC
                                        </TransactionButton>
                                    </div>

                                    <TransactionButton
                                        className={"!w-full !px-3 !sm:px-4 !py-2 !bg-yellow-500 !hover:bg-yellow-600 !text-black !font-medium !rounded-lg !transition-colors !duration-200 !text-sm"}
                                        transaction={async () => {
                                            const tx = prepareContractCall({
                                                contract: PaymentContract,
                                                method: "function approve(address spender, uint256 value) returns (bool)",
                                                params: [userContract, AmountForDeposit * 1e6],
                                            });
                                            return tx;
                                        }}
                                        onTransactionSent={(result) => {
                                            console.log("Transaction submitted", result.transactionHash);
                                        }}
                                        onTransactionConfirmed={(receipt) => {
                                            console.log("Transaction confirmed", receipt.transactionHash);
                                        }}
                                        onError={(error) => {
                                            console.error("Transaction error", error);
                                        }}
                                    >
                                        Approve $USDC For Deposit
                                    </TransactionButton>
                                </div>
                            </section>

                            {/* Product Management Section */}
                            <section className="bg-slate-800 rounded-lg shadow-md p-4 sm:p-5 border border-slate-700">
                                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-yellow-400 border-b border-slate-700 pb-2">Product Management</h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                                    <input type="text" placeholder="Barcode" value={productBarcode} onChange={e => setProductBarcode(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
                                    <button onClick={() => LoadProduct(productBarcode)} className="px-3 sm:px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center text-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        Load Product
                                    </button>
                                    <input type="text" placeholder="Product Name" value={productName} onChange={e => setProductName(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
                                    <input type="text" placeholder="Category" value={productCategory} onChange={e => setProductCategory(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                    <input type="number" placeholder={type == 'Sales' ? "Price in USDC" : "Price Per Day in USDC"} value={productPrice} onChange={e => setProductPrice(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="number" placeholder="Quantity" value={produtQuantity} onChange={e => setProdutQuantity(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
                                        <input type="number" placeholder="Discount %" value={productDiscount} onChange={e => setProductDiscount(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <textarea value={productDescription} onChange={e => setProductDescription(e.target.value)} rows="6" placeholder="Product description..." className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white resize-none text-sm" />
                                </div>

                                {/* Product Images */}
                                {showImageInputs && (
                                    <div className="mb-4 space-y-2">
                                        {/* Image Upload Inputs */}
                                        {images.map((image, index) => (
                                            <div key={index} className="mb-4 p-4 border border-gray-600 rounded-lg bg-gray-800">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-white font-medium">
                                                        Product Image {index + 1}
                                                    </span>
                                                    {isUploadingImages[index] && (
                                                        <span className="text-yellow-400 text-sm">
                                                            Uploading... {imageUploadProgress[index]}%
                                                        </span>
                                                    )}
                                                    {!isUploadingImages[index] && image && (
                                                        <span className="text-green-400 text-sm">✓ Uploaded</span>
                                                    )}
                                                </div>

                                                {/* File Input */}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(index, e.target.files[0])}
                                                    disabled={isUploadingImages[index]}
                                                    className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2"
                                                />

                                                {/* Upload Progress Bar */}
                                                {isUploadingImages[index] && (
                                                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                                                        <div
                                                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                                            style={{ width: `${imageUploadProgress[index]}%` }}
                                                        ></div>
                                                    </div>
                                                )}

                                                {/* Display CID if uploaded */}
                                                {!isUploadingImages[index] && image && (
                                                    <div className="text-green-400 text-sm break-all mt-2">
                                                        CID: {image}
                                                    </div>
                                                )}

                                                {/* Remove Image Button */}
                                                {image && (
                                                    <button
                                                        onClick={() => handleRemoveImage(index)}
                                                        className="mt-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-200 text-xs"
                                                    >
                                                        Remove Image
                                                    </button>
                                                )}
                                            </div>
                                        ))}

                                        {/* Add Product Image Button */}
                                        <button
                                            onClick={handleAddImage}
                                            className="px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors duration-200 text-xs sm:text-sm"
                                        >
                                            Add Product Image
                                        </button>
                                    </div>
                                )}

                                {/* Product Action Buttons */}

                                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
                                    <TransactionButton
                                        className={`!py-2 !bg-yellow-500 !hover:bg-yellow-600 !text-black !font-medium !rounded-lg !transition-colors !duration-200 !text-xs !sm:text-sm`}
                                        transaction={async () => {
                                            if (type == 'Rentals') {
                                                const newPrice = await Math.round((productPrice * 1e6));
                                                const imagesArray = images.filter(img => img !== '');
                                                const tx = prepareContractCall({
                                                    contract: adminContract,
                                                    method: "function addProduct(string _name, string _barcode, uint256 _priceInNormalNumber, uint256 _quantity, string[] _productImages, string _productDescription, uint256 _discountPercentage, string _category)",
                                                    params: [productName, productBarcode, newPrice, produtQuantity, imagesArray, productDescription, productDiscount, productCategory],
                                                });
                                                return tx;
                                            }
                                            if (type == 'Liquidity') {
                                                const newPrice = await Math.round((productPrice * 1e6));
                                                const imagesArray = images.filter(img => img !== '');
                                                const tx = prepareContractCall({
                                                    contract: adminContract,
                                                    method: "function addProduct(string _name, string _barcode, uint256 _priceInNormalNumber, uint256 _quantity, string[] _productImages, string _productDescription, uint256 _discountPercentage, string _category)",
                                                    params: [productName, productBarcode, newPrice, produtQuantity, imagesArray, productDescription, productDiscount, productCategory],
                                                });
                                                return tx;
                                            }
                                            if (type == 'Renting') {
                                                const newPrice = await Math.round((productPrice * 1e6));
                                                const imagesArray = images.filter(img => img !== '');
                                                const tx = prepareContractCall({
                                                    contract: adminContract,
                                                    method: "function addProduct(string _name, string _barcode, uint256 _priceInNormalNumber, uint256 _quantity, string[] _productImages, string _productDescription, uint256 _discountPercentage, string _category)",
                                                    params: [productName, productBarcode, newPrice, produtQuantity, imagesArray, productDescription, productDiscount, productCategory],
                                                });
                                                return tx;
                                            }
                                            else if (type == 'Sales') {
                                                const imagesArray = images.filter(img => img !== '');
                                                const tx = prepareContractCall({
                                                    contract: adminContract,
                                                    method: "function addProduct(string _name, string _barcode, uint256 _priceInNormalNumber, uint256 _quantity, string[] _productImages, string _productDescription, uint256 _discountPercentage, string _category)",
                                                    params: [productName, productBarcode, productPrice * 1e6, produtQuantity, imagesArray, productDescription, productDiscount, productCategory],
                                                });
                                                return tx;
                                            }
                                        }}
                                        onTransactionSent={(result) => {
                                            console.log("Transaction submitted", result.transactionHash);
                                        }}
                                        onTransactionConfirmed={(receipt) => {
                                            console.log("Transaction confirmed", receipt.transactionHash);
                                        }}
                                        onError={(error) => {
                                            console.error("Transaction error", error);
                                        }}
                                    >
                                        Add Product
                                    </TransactionButton>
                                    <TransactionButton
                                        className={`!px-2 !sm:px-4 !py-2 !bg-yellow-500 !hover:bg-yellow-600 !text-black !font-medium !rounded-lg !transition-colors !duration-200 !text-xs !sm:text-sm`}
                                        transaction={async () => {
                                            if (type == 'Renting') {
                                                const newPrice = await Math.round((productPrice * 1e6));
                                                const imagesArray = images.filter(img => img !== '');
                                                const tx = prepareContractCall({
                                                    contract: adminContract,
                                                    method: "function editProduct(string _barcode, string _name, uint256 _priceInNormalNumber, string[] _productImages, string _productDescription, string _category)",
                                                    params: [productBarcode, productName, newPrice, imagesArray, productDescription, productCategory],
                                                });
                                                return tx;
                                            }
                                            if (type == 'Rentals') {
                                                const newPrice = await Math.round((productPrice * 1e6));
                                                const imagesArray = images.filter(img => img !== '');
                                                const tx = prepareContractCall({
                                                    contract: adminContract,
                                                    method: "function editProduct(string _barcode, string _name, uint256 _priceInNormalNumber, string[] _productImages, string _productDescription, string _category)",
                                                    params: [productBarcode, productName, newPrice, imagesArray, productDescription, productCategory],
                                                });
                                                return tx;
                                            }
                                            if (type == 'Liquidity') {
                                                const newPrice = await Math.round((productPrice * 1e6));
                                                const imagesArray = images.filter(img => img !== '');
                                                const tx = prepareContractCall({
                                                    contract: adminContract,
                                                    method: "function editProduct(string _barcode, string _name, uint256 _priceInNormalNumber, string[] _productImages, string _productDescription, string _category)",
                                                    params: [productBarcode, productName, newPrice, imagesArray, productDescription, productCategory],
                                                });
                                                return tx;
                                            }
                                            else if (type == 'Sales') {
                                                const imagesArray = images.filter(img => img !== '');
                                                const tx = prepareContractCall({
                                                    contract: adminContract,
                                                    method: "function editProduct(string _barcode, string _name, uint256 _priceInNormalNumber, string[] _productImages, string _productDescription, string _category)",
                                                    params: [productBarcode, productName, productPrice * 1e6, imagesArray, productDescription, productCategory],
                                                });
                                                return tx;
                                            }
                                        }}
                                        onTransactionSent={(result) => {
                                            console.log("Transaction submitted", result.transactionHash);
                                        }}
                                        onTransactionConfirmed={(receipt) => {
                                            console.log("Transaction confirmed", receipt.transactionHash);
                                        }}
                                        onError={(error) => {
                                            console.error("Transaction error", error);
                                        }}
                                    >
                                        Edit Product
                                    </TransactionButton>
                                    <button onClick={updateProductQuantity} className="px-2 sm:px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-200 text-xs sm:text-sm">
                                        Update Quantity
                                    </button>
                                    <button onClick={changeProductDiscount} className="px-2 sm:px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-200 text-xs sm:text-sm">
                                        Update Discount
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                                    <input type="text" placeholder="Store Contract" value={setstoring} onChange={e => setsetstoring(e.target.value)} className="sm:col-span-2 p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
                                    <TransactionButton
                                        className={"!px-3 !sm:px-4 !py-2 !bg-yellow-500 !hover:bg-yellow-600 !text-black !font-medium !rounded-lg !transition-colors !duration-200 !text-sm"}
                                        transaction={async () => {
                                            const tx = prepareContractCall({
                                                contract: inv,
                                                method: "function setStore(address _ERCUltraStore)",
                                                params: [setstoring]
                                            });
                                            return tx;
                                        }}
                                        onTransactionSent={(result) => {
                                            console.log("Transaction submitted", result.transactionHash);
                                        }}
                                        onTransactionConfirmed={(receipt) => {
                                            console.log("Transaction confirmed", receipt.transactionHash);
                                        }}
                                        onError={(error) => {
                                            console.error("Transaction error", error);
                                        }}
                                    >
                                        SetStore
                                    </TransactionButton>
                                </div>
                                {/* Hidden Media Section - New API based implementation */}
                                <div className="bg-slate-700/50 rounded-lg p-3 sm:p-4 mb-4">
                                    <h3 className="text-base sm:text-lg font-medium mb-3 text-gray-200">Hidden Media Management (Token Gated)</h3>
                                    <div className="grid grid-cols-1 gap-3 mb-3">
                                        <input type="text" placeholder="Product Barcode" value={productBarcode} onChange={e => setProductBarcode(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
                                        
                                        {/* File Upload for Hidden Media */}
                                        <div className="p-4 border border-gray-600 rounded-lg bg-gray-800">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-white font-medium">Upload Media File</span>
                                                {isUploadingHidden && <span className="text-yellow-400 text-sm">Uploading... {hiddenUploadProgress}%</span>}
                                                {!isUploadingHidden && hiddenIPFS && <span className="text-green-400 text-sm">✓ Ready to Link</span>}
                                            </div>
                                            
                                            <input
                                                type="file"
                                                onChange={(e) => handleHiddenMediaUpload(e.target.files[0])}
                                                disabled={isUploadingHidden}
                                                className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2"
                                            />
                                            
                                            {isUploadingHidden && (
                                                <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                                                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${hiddenUploadProgress}%` }}></div>
                                                </div>
                                            )}
                                            
                                            {!isUploadingHidden && hiddenIPFS && (
                                                <div className="text-green-400 text-sm break-all mb-2">
                                                    CID: {hiddenIPFS}
                                                </div>
                                            )}
                                            
                                            {hiddenIPFS && (
                                                <button onClick={handleRemoveHiddenMedia} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-200 text-xs">
                                                    Clear File
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <button
                                            onClick={handleUploadHiddenContent}
                                            disabled={!hiddenIPFS || isUploadingHidden}
                                            className="px-2 sm:px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-200 text-xs sm:text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Upload Hidden Video (DB)
                                        </button>
                                        <button
                                            onClick={handleEditHiddenContent}
                                            disabled={!hiddenIPFS || isUploadingHidden}
                                            className="px-2 sm:px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-200 text-xs sm:text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Edit Hidden Video (DB)
                                        </button>
                                    </div>
                                </div>
                            </section>




                            {/* Admin Settings Section */}
                            <section className="bg-slate-800 rounded-lg shadow-md p-4 sm:p-5 border border-slate-700">
                                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-yellow-400 border-b border-slate-700 pb-2">Admin Settings</h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input type="text" placeholder="New Owner Address" value={newOwner} onChange={e => setNewOwner(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
                                    <button onClick={handleChangeOwner} className="px-3 sm:px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-200 text-xs sm:text-sm flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                        Change Owner
                                    </button>
                                </div>
                            </section>
                        </div>
                        <button onClick={adminLogout} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold">
                        Logout
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center min-h-[55vh] sm:min-h-[65vh] px-3 sm:px-6 py-6">
  <div className="relative w-full max-w-sm sm:max-w-md">
    
    {/* glow */}
    <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-r from-yellow-400/20 via-amber-500/10 to-yellow-400/20 blur-2xl" />

    <div className="relative w-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-5 sm:p-8">
      
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-yellow-400/15 border border-yellow-400/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-yellow-300"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Admin Login
        </h2>
        <p className="mt-1 text-sm text-gray-300">
        Connect wallet + sign message to receive Admin Token
        </p>
      </div>

      <div className="space-y-4 sm:space-y-5">
        {/* Contract */}
        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Contract Address
          </label>
          <input
            type="text"
            placeholder="0x..."
            value={userContract}
            onChange={(e) => setUserContract(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-gray-400 outline-none transition
                       focus:border-yellow-400/40 focus:ring-2 focus:ring-yellow-400/20"
          />
        </div>

        {/* Buttons */}
        <div className="pt-1 space-y-3">
          <button
            onClick={() => adminLogin(userContract)}
            disabled={!userContract}
            className="w-full rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-3 font-extrabold text-black
                       shadow-[0_15px_40px_rgba(255,221,0,0.15)]
                       transition hover:brightness-110 active:scale-[0.99]
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Login
            </span>
          </button>

          <button
            onClick={() => navigate("/shop/ultrashop/products/LISTESH/extra/")}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white
                       transition hover:bg-white/10 hover:border-yellow-400/30"
          >
            Register
          </button>
        </div>

        {/* small note */}
        <p className="text-center text-xs text-gray-400 pt-2">
          Tip: paste the contract address exactly (0x...) for fastest login.
        </p>
      </div>
    </div>
  </div>
</div>

                )}
            </div>
        </div>
    );
}

export default ClientAdminPage;