import React, { useEffect, useState } from "react";
import Banner from "../../../components/Banner";
import { motion } from "framer-motion";
import contactImg from "../../../assets/contact.jpg";
import DownloadModal from "./DowloadModal";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import axios from "axios";

const AdminCart = () => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [carts, setCarts] = useState([]);

  const openPopup = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDownload = (format) => {
    setIsModalOpen(false);

    const formattedData = carts.map((item) => ({
      "Tour Name": item.tourName?.en || "N/A",
      Category: item.categoryName?.en || "N/A",
      "User Name": item.username || "N/A",
      "User Email": item.userEmail || "N/A",
    }));

    if (format === "pdf") {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("Carts Tours Data", 14, 22);

      doc.setLineWidth(0.5);
      doc.line(14, 24, 196, 24);

      doc.setFontSize(12);
      const startY = 30;
      let currentY = startY;

      const headers = ["Tour Name", "Category", "User Name", "User Email"];
      const colWidths = [50, 50, 40, 50];
      headers.forEach((header, index) => {
        doc.text(
          header,
          14 + colWidths.slice(0, index).reduce((a, b) => a + b, 0),
          currentY
        );
      });

      currentY += 8;

      formattedData.forEach((item, index) => {
        doc.text(item["Tour Name"], 14, currentY);
        doc.text(item.Category, 64, currentY);
        doc.text(item["User Name"], 114, currentY);
        doc.text(item["User Email"], 154, currentY);

        currentY += 8;

        if (currentY > 280) {
          doc.addPage();
          currentY = startY;
        }
      });

      doc.save("CartsToursData.pdf");
    } else if (format === "excel") {
      const worksheet = XLSX.utils.json_to_sheet(formattedData);

      XLSX.utils.sheet_add_aoa(
        worksheet,
        [["Tour Name", "Category", "User Name", "User Email"]],
        {
          origin: "A1",
        }
      );

      const colWidths = [{ wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 25 }];
      worksheet["!cols"] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Favourites");

      XLSX.writeFile(workbook, "FavouriteToursData.xlsx");
    }
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const cartResponse = await axios.get(`${BASE_URL}/admin/cart/`);
        console.log("Cart Data:", cartResponse.data);
        setCarts(cartResponse.data.data.carts || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    getData();
  }, []);

  console.log(carts);

  const filteredCarts = carts.filter(
    (item) =>
      item.tourName?.en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryName?.en
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.userEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCarts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCarts.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <Banner
        image={contactImg}
        title={"Admin Cart"}
        subTitle={"Home | Admin-Cart"}
      />

      <div className="p-5">
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.5 }}
          className="p-6 mt-5 mb-5 border border-4 shadow-lg rounded-lg"
        >
          <div className="mb-4 flex items-center justify-between">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 w-full sm:w-[500px] py-2 border-b-4 border-yellow-500 font-semibold text-lg outline-none shadow-sm"
            />
            <button
              onClick={openPopup}
              className="bg-yellow-400 p-2 rounded-md"
            >
              Download
            </button>
          </div>

          <div className="overflow-x-auto">
            {currentItems.length > 0 ? (
              <>
                <table className="min-w-full divide-y divide-gray-200 bg-white shadow-md rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">
                        Tour Details
                      </th>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">
                        User Contact
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-md font-medium text-gray-900">
                          {item.tourName?.en || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-md text-gray-500">
                          {item.categoryName?.en || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-md text-gray-500">
                          {item.username || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-md text-gray-500">
                          {item.userEmail || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p className="text-center text-lg text-gray-500">No data found</p>
            )}
          </div>

          <div className="flex flex-wrap justify-center mt-4 gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg shadow-sm disabled:opacity-50"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`px-4 py-2 ${
                  currentPage === index + 1
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-300 text-gray-700"
                } rounded-lg shadow-sm`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg shadow-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </motion.div>
      </div>
      <DownloadModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default AdminCart;
