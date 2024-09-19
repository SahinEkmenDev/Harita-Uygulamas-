import React, { useState, useEffect } from "react";
import { Table, Modal, Button, message } from "antd";

const TaleplerTable = ({ isVisible, onClose }) => {
  const [requests, setRequests] = useState([]);

  // Talepleri API'den alma fonksiyonu
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await fetch(
        "https://localhost:7072/api/auth/admin/list-password-reset-requests",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Talepler başarıyla alındı:", data);
        setRequests(data); // Talepleri state'e kaydediyoruz
      } else {
        console.error("Talepler alınamadı:", response.statusText);
      }
    } catch (error) {
      console.error("Talepler alınırken hata oluştu:", error);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchRequests(); // Modal açıldığında talepleri çek
    }
  }, [isVisible]);

  // Tablo kolonları
  const columns = [
    {
      title: "Talep ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Kullanıcı",
      dataIndex: ["user", "username"],
      key: "user.username",
    },
    {
      title: "Talep Zamanı",
      dataIndex: "requestTime",
      key: "requestTime",
      render: (text) => new Date(text).toLocaleString(), // Tarihi okunabilir formatta göster
    },
    {
      title: "İşlemler",
      key: "actions",
      render: (text, record) => (
        <Button type="primary" onClick={() => handleApproveRequest(record.id)}>
          Onayla
        </Button>
      ),
    },
  ];

  const handleApproveRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await fetch(
        `https://localhost:7072/api/auth/admin/approve-password-reset/${requestId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // response.json() yerine response.text() kullanarak düz metni alıyoruz
        const result = await response.text();
        message.success(result); // Düz metni başarı mesajı olarak gösteriyoruz
        fetchRequests(); // Talepleri güncellemek için yeniden çekiyoruz
      } else {
        message.error("Talep onaylanırken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Talep onaylanırken hata oluştu:", error);
      message.error("Talep onaylanırken bir hata oluştu.");
    }
  };

  return (
    <Modal
      title="Şifre Sıfırlama Talepleri"
      visible={isVisible}
      onCancel={onClose}
      footer={null} // Modal altındaki default butonları kaldırıyoruz
      width="80%"
    >
      <Table
        dataSource={requests}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        bordered
      />
    </Modal>
  );
};

export default TaleplerTable;
