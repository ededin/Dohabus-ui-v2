import React, { useState, useEffect } from "react";
import useFirebaseUpload from "../../../hooks/use-firebaseUpload";
import axios from "axios";
import { useSelector } from "react-redux";
import { IoCameraOutline } from "react-icons/io5";
import Card from "./Card";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import Loader from "../../../components/Loader";

const CreateCategory = () => {
    const mainUser = useSelector((state) => state.user.user);
    const BASE_URL = import.meta.env.VITE_BASE_URL; // Make sure to set your BASE_URL properly
    const [image, setImage] = useState(null);
    const lang = useSelector((state) => state.language.lang);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [title, setTitle] = useState({ en: "", ar: "" });
    const [description, setDescription] = useState({ en: "", ar: "" });

    const [duration, setDuration] = useState({ en: "", ar: "" });
    const [price, setPrice] = useState(0);

    const [file, setFile] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFile(file); // Set the file state to trigger Firebase upload
        }
    };

    const handleCreate = async (isEdit) => {
        setLoading(true);
        if (mainUser.role !== "super-admin") return;
        try {
            let updatedCategory;

            if (isEdit) {
                // Edit an existing category
                const res = await axios.put(
                    `${BASE_URL}/populor-couries/${selectedData._id}`,
                    {
                        title,
                        description,
                        coverImage: image,
                        duration,
                        price,
                    }
                );

                updatedCategory = res.data.data.courise;

                // Update the category in the state
                setCategories((prevCategories) =>
                    prevCategories.map((category) =>
                        category._id === updatedCategory?._id
                            ? updatedCategory
                            : category
                    )
                );
                setIsOpen(false);

                setLoading(false);
                return toast.success("New courise created", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            } else {
                // Create a new category
                const res = await axios.post(`${BASE_URL}/populor-couries`, {
                    title,
                    description,
                    coverImage: image,
                    duration,
                    price,
                });
                updatedCategory = res.data.data.courise;

                // Add the new category to the end of the state array
                setCategories((prevCategories) => [
                    ...prevCategories,
                    updatedCategory,
                ]);
            }

            // Log the creation/update

            // Close the modal or form
            setIsOpen(false);

            // Reset form fields
            setTitle({ en: "", ar: "" });
            setDescription({ en: "", ar: "" });
            setImage(null);
            setSelectedData(null);
            toast.success("Hotel details updated", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            setLoading(false);
        } catch (error) {
            setLoading(false);

            console.error(error);

            toast.error("Some error occurred", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        }
    };

    const handleDialog = (data = null) => {
        if (mainUser.role !== "super-admin") return;
        if (data) {
            // Edit mode
            setSelectedData(data);
            setTitle(data.title);
            setDescription(data.description);
            setImage(data.coverImage);
            setDuration(data.duration);
            setPrice(data.price);
        } else {
            // Create mode
            setSelectedData(null);
            setTitle({ en: "", ar: "" });
            setDescription({ en: "", ar: "" });
            setImage(null);
            setDuration({ en: "", ar: "" });
            setPrice(0);
        }
        setIsOpen((prev) => !prev);
    };
    const { progress, error, downloadURL } = useFirebaseUpload(file);
    useEffect(() => {
        if (downloadURL) {
            setImage(downloadURL); // Update formData with the Firebase download URL
        }
    }, [downloadURL]);

    useEffect(() => {
        const getData = async () => {
            try {
                const res = await axios.get(BASE_URL + "/populor-couries");
                setCategories(res.data.data.courise);
            } catch (error) {
                console.log(error);
            }
        };
        getData();
    }, []);
    return (
        <div>
            {isOpen && (
                <div className="fixed inset-0 bg-white bg-opacity-50 z-30 backdrop-blur-sm flex justify-center items-center">
                    <div className="bg-white shadow-lg rounded-lg flex flex-col md:flex-row w-full md:w-[800px] gap-4 p-5 border shadow-xl">
                        <div className="flex-1 flex items-center justify-center">
                            <label className="flex flex-col justify-center items-center cursor-pointer h-full">
                                {!image ? (
                                    <>
                                        <IoCameraOutline className="w-12 h-12 text-gray-500" />
                                        <input
                                            type="file"
                                            className="hidden"
                                            id="coverImage"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </>
                                ) : (
                                    <img
                                        src={image}
                                        alt="Selected"
                                        className="w-full h-full object-cover rounded-md"
                                    />
                                )}{" "}
                                {progress > 0 && progress !== 100 && (
                                    <p>Upload progress: {progress}%</p>
                                )}
                                {error && (
                                    <p className="text-red-500">
                                        Error: {error.message}
                                    </p>
                                )}
                            </label>
                        </div>
                        <div className="flex-1 space-y-5">
                            {/* Title in English */}
                            <input
                                type="text"
                                value={title.en}
                                onChange={(e) =>
                                    setTitle((prev) => ({
                                        ...prev,
                                        en: e.target.value,
                                    }))
                                }
                                placeholder="Title (English)"
                                className="w-full p-2 border border-black rounded-lg outline-none"
                            />

                            {/* Title in Arabic */}
                            <input
                                dir="rtl"
                                type="text"
                                value={title.ar}
                                onChange={(e) =>
                                    setTitle((prev) => ({
                                        ...prev,
                                        ar: e.target.value,
                                    }))
                                }
                                placeholder="العنوان (بالعربية)" // Arabic for 'Title'
                                className="w-full p-2 border border-black rounded-lg outline-none"
                            />

                            {/* Description in English */}
                            <textarea
                                value={description.en}
                                onChange={(e) =>
                                    setDescription((prev) => ({
                                        ...prev,
                                        en: e.target.value,
                                    }))
                                }
                                placeholder="Description (English)"
                                className="w-full h-[100px] p-2 border border-black rounded-lg outline-none resize-none"
                            />

                            {/* Description in Arabic */}
                            <textarea
                                dir="rtl"
                                value={description.ar}
                                onChange={(e) =>
                                    setDescription((prev) => ({
                                        ...prev,
                                        ar: e.target.value,
                                    }))
                                }
                                placeholder="الوصف (بالعربية)" // Arabic for 'Description'
                                className="w-full h-[100px] p-2 border border-black rounded-lg outline-none resize-none"
                            />

                            <input
                                type="text"
                                value={duration.en}
                                onChange={(e) =>
                                    setDuration((prev) => ({
                                        ...prev,
                                        en: e.target.value,
                                    }))
                                }
                                placeholder="Duration (English)"
                                className="w-full p-2 border border-black rounded-lg outline-none"
                            />

                            {/* Title in Arabic */}
                            <input
                                dir="rtl"
                                type="text"
                                value={duration.ar}
                                onChange={(e) =>
                                    setDuration((prev) => ({
                                        ...prev,
                                        ar: e.target.value,
                                    }))
                                }
                                placeholder="العنوان (بالعربية)" // Arabic for 'Title'
                                className="w-full p-2 border border-black rounded-lg outline-none"
                            />
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="Duration (English)"
                                className="w-full p-2 border border-black rounded-lg outline-none"
                            />

                            <div className="flex gap-2">
                                <button
                                    className="px-3 bg-custom-yellow py-1 rounded-md duration-300 hover:bg-black hover:text-white"
                                    onClick={() => handleDialog()}
                                >
                                    Close
                                </button>

                                {selectedData ? (
                                    <button
                                        className="px-3 bg-custom-yellow py-1 rounded-md duration-300 hover:bg-black hover:text-white"
                                        onClick={() => handleCreate(true)}
                                    >
                                        {loading ? (
                                            <div className="">
                                                <Loader w={20} h={20} b={5} />
                                            </div>
                                        ) : (
                                            "Update"
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        className="px-3 bg-custom-yellow py-1 rounded-md duration-300 hover:bg-black hover:text-white"
                                        onClick={() => handleCreate(false)}
                                    >
                                        {loading ? (
                                            <div className="">
                                                <Loader w={20} h={20} b={5} />
                                            </div>
                                        ) : (
                                            "Create"
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-subtitle font-bold">All Courise</h1>
                    <p className="text-small text-red">
                        Manage your tour Courise
                    </p>
                </div>
                <div>
                    {mainUser && mainUser.role === "super-admin" && (
                        <button
                            className="px-5 bg-custom-yellow py-2 rounded-md duration-300 hover:bg-black hover:text-white"
                            onClick={() => handleDialog()}
                        >
                            Create
                        </button>
                    )}
                </div>
            </div>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-10 flex-wrap">
                {categories.map((card) => (
                    <Card
                        key={card?._id}
                        title={
                            card?.title ? card?.title[lang] : "Default Title"
                        }
                        description={
                            card?.description
                                ? card?.description[lang]
                                : "Default Description"
                        }
                        imageUrl={card?.coverImage || "default-image-url"} // Replace with a default image URL
                        onClick={() => handleDialog(card)}
                    />
                ))}
            </div>
        </div>
    );
};

export default CreateCategory;
