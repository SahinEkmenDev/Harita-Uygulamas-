import React, { useState, useEffect } from "react";
import { Table, Button, Dropdown, Menu, Modal, Input, message } from "antd"; // Ant Design bileşenlerini kullanıyoruz
import { MoreOutlined } from "@ant-design/icons"; // İkonlar

function UserManagement() {
  const [users, setUsers] = useState([]); // Kullanıcı verilerini tutmak için state
  const [visible, setVisible] = useState(false); // Modal için visible state'i
  const [selectedUser, setSelectedUser] = useState(null); // Seçili kullanıcı

  // Kullanıcıları backend'den çekme
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("https://localhost:7072/api/users"); // Backend'den kullanıcıları çekme
      const data = await response.json();
      setUsers(data); // Kullanıcıları state'e set et
    } catch (error) {
      message.error("Kullanıcılar alınırken hata oluştu.");
    }
  };

  const handleAddUser = () => {
    message.info("Kullanıcı ekleme işlemi burada yapılacak.");
  };

  const handleDeleteUser = (userId) => {
    message.info(`Kullanıcı ${userId} silinecek.`);
  };

  const handleUpdateUser = (user) => {
    setSelectedUser(user);
    setVisible(true); // Modal açılır
  };

  const handleCancel = () => {
    setVisible(false);
    setSelectedUser(null);
  };

  const columns = [
    {
      title: "Kullanıcı Adı",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Rol",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item onClick={() => handleUpdateUser(record)}>
                Rol Belirle / Şifre Güncelle
              </Menu.Item>
              <Menu.Item onClick={() => handleDeleteUser(record.id)}>
                Sil
              </Menu.Item>
            </Menu>
          }
          trigger={["click"]}
        >
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={handleAddUser}>
        Kullanıcı Ekle
      </Button>
      <Table dataSource={users} columns={columns} rowKey="id" />

      <Modal
        title="Kullanıcı Güncelle"
        visible={visible}
        onCancel={handleCancel}
        onOk={() => {
          // Güncelleme işlemi burada yapılır (backend'e istek atılır)
          setVisible(false);
        }}
      >
        <p>Kullanıcı Adı: {selectedUser?.username}</p>
        <Input
          placeholder="Yeni Rol"
          value={selectedUser?.role}
          onChange={(e) =>
            setSelectedUser({ ...selectedUser, role: e.target.value })
          }
        />
        <Input.Password placeholder="Yeni Şifre" />
      </Modal>
    </div>
  );
}

export default UserManagement;
