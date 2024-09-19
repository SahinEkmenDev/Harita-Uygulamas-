import React, { useState, useEffect, useRef } from "react";
import "./mapcomponent.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import bcrypt from "bcryptjs";
import AdminMenu from "./adminmenu";
import { fromLonLat } from "ol/proj";
import Draw from "ol/interaction/Draw";
import Modify from "ol/interaction/Modify";
import { Table, Modal, Space, message } from "antd";
import TaleplerTable from "./TaleplerTable";
import "font-awesome/css/font-awesome.min.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import WKT from "ol/format/WKT";
import { Style, Stroke, Fill } from "ol/style";
import Translate from "ol/interaction/Translate";
import Select from "ol/interaction/Select";
import Collection from "ol/Collection";
import { PieChart, Pie, Cell, Legend } from "recharts";
import Overlay from "ol/Overlay";

import { Tooltip } from "antd";
import logo from "../assets/basarsoft.png";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { Dropdown, Menu } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { extend as olExtentExtend } from "ol/extent";
import { Input, Drawer, Button } from "antd";
import { jwtDecode } from "jwt-decode";

const MySwal = withReactContent(Swal);

const MapComponent = ({ userRole }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [subMenuOpen, setSubMenuOpen] = useState(false); // Submenu için state
  const [data, setData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [userManagementVisible, setUserManagementVisible] = useState(false); // Kullanıcı yönetimi modalını aç/kapat

  const [draw, setDraw] = useState(null);
  const [userName, setUserName] = useState("");
  const [successId, setSuccessId] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [users, setUsers] = useState([]); // Kullanıcı verilerini tutacak state
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isDashboardVisible, setIsDashboardVisible] = useState(false); // Dashboard görünürlüğü
  const [dashboardData, setDashboardData] = useState(null); // Dashboard verileri

  const [isUserManagementVisible] = useState(false); // Kullanıcı yönetimi modalı

  const [isTaleplerVisible, setIsTaleplerVisible] = useState(false); // Talepler modalı

  const [newPassword, setNewPassword] = useState(""); // Kullanıcının girdiği yeni şifre

  const mapElement = useRef();
  const mapRef = useRef(null);
  const vectorSourceRef = useRef(new VectorSource());
  const overlayRef = useRef();
  const [adminMenuOpen, setAdminMenuOpen] = useState(false); // Admin menüsü aç/kapat durumu

  const userInfo = localStorage.getItem("username");

  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false); // Modal görünürlüğü için state
  const [selectedUser, setSelectedUser] = useState(null); // Seçili kullanıcıyı tutmak için state
  const [newRole, setNewRole] = useState(""); // Yeni rolü tutmak için state

  // Talepler modalını açma fonksiyonu
  const showTalepler = () => {
    setIsTaleplerVisible(true);
  };

  // Talepler modalını kapatma fonksiyonu
  const hideTalepler = () => {
    setIsTaleplerVisible(false);
  };

  const handleRoleUpdate = (user) => {
    setSelectedUser(user); // Seçilen kullanıcıyı state'e kaydet
    setNewRole(user.role); // Mevcut rolü modal içinde göstermek için
    setIsRoleModalVisible(true); // Modalı aç
  };
  // Dashboard verilerini fetch eden fonksiyon
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await fetch("https://localhost:7072/api/dashboard", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Dashboard verileri:", data);

        // Gelen veriyi uygun formata dönüştürüyoruz
        const formattedData = [
          { name: "Toplam Kullanıcılar", value: data.totalUsers },
          { name: "Aktif Kullanıcılar", value: data.activeUsers },
          { name: "Geometrik Veriler", value: data.totalGeometries },
        ];

        setDashboardData(formattedData); // Veriyi uygun formatta set ediyoruz
      } else {
        console.error("Dashboard verileri alınamadı.");
      }
    } catch (error) {
      console.error("Dashboard verileri alınırken hata oluştu:", error);
    }
  };

  // Dashboard'u açarken veriyi çek
  const openDashboard = () => {
    fetchDashboardData();
    setIsDashboardVisible(true);
  };

  // Dashboard'u kapatma fonksiyonu
  const handleDashboardCancel = () => {
    setIsDashboardVisible(false);
  };

  // Pasta grafiği renkleri
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const DashboardModal = ({
    isDashboardVisible,
    handleDashboardCancel,
    dashboardData,
  }) => {
    return (
      <Modal
        title="Dashboard"
        visible={isDashboardVisible}
        onCancel={handleDashboardCancel}
        footer={null} // Alt kısımda butonlar yok
      >
        <PieChart width={400} height={300}>
          <Pie
            data={dashboardData}
            dataKey="value" // Her bir dilimin değeri
            nameKey="name" // Her bir dilimin adı
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {dashboardData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </Modal>
    );
  };

  const pieData = [
    { name: "Toplam Kullanıcı", value: dashboardData?.totalUsers || 0 },
    {
      name: "Toplam Geometrik Veri",
      value: dashboardData?.totalGeometries || 0,
    },
    { name: "Aktif Kullanıcılar", value: dashboardData?.activeUsers || 0 },
  ];

  const handleRoleModalOk = async () => {
    // Backend'e güncelleme isteği atacağız
    const token = localStorage.getItem("jwtToken");

    try {
      const response = await fetch(
        `https://localhost:7072/api/users/${selectedUser.id}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }), // Yeni rolü gönderiyoruz
        }
      );

      if (response.ok) {
        message.success("Rol başarıyla güncellendi.");
        fetchUsers(); // Kullanıcıları yeniden yükle
      } else {
        message.error("Rol güncellenirken bir hata oluştu.");
      }
    } catch (error) {
      message.error("Rol güncellenirken bir hata oluştu.");
    }

    setIsRoleModalVisible(false); // Modalı kapat
  };

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("username");
    window.location.reload(); // Sayfayı yenileyerek logout işlemini tamamlıyoruz
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      console.log("Token:", token); // Token kontrolü yapıyoruz

      if (!token) {
        console.error("Token bulunamadı.");
        return;
      }

      const response = await fetch("https://localhost:7072/api/users", {
        headers: {
          Authorization: `Bearer ${token}`, // JWT Token ekleniyor
        },
      });

      console.log("API yanıtı durumu:", response.status); // API yanıt durumu (200, 401, 500 vs.)

      if (response.ok) {
        const data = await response.json();
        console.log("Kullanıcı verileri:", data); // Gelen verileri kontrol ediyoruz
        setUsers(data); // Gelen veriyi state'e ekliyoruz
      } else {
        console.error("API isteğinde hata:", response.statusText); // Yanıt hatalıysa logla
        message.error(
          `Kullanıcılar alınırken hata oluştu: ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("API çağrısı sırasında bir hata oluştu:", error); // Hata yakalama
      message.error("Kullanıcılar alınırken bir hata oluştu.");
    }
  };
  useEffect(() => {
    console.log("useEffect çağrıldı!"); // Bu çalışmazsa, bileşen render edilmemiş demektir.
    fetchUsers(); // Verileri çekmeye çalışıyoruz.
  }, []);

  const handleProfileClick = () => {
    setProfileMenuOpen(!profileMenuOpen); // Profil menüsünü açıp kapatma
  };
  const colorMap = {
    Eymen: "red",
    Mustafa: "green",
    Ayşe: "blue",
    Can: "orange", // Can dış kenar turuncu
    Ahmet: "Yellow",
    sahin68: "purple",
    Selim: "black",

    // Diğer kullanıcılar için renkler ekleyin
  };
  const handleUserManagementClick = () => {
    setMenuOpen(false); // Sağdaki menüyü kapatıyoruz
    setUserManagementVisible(true); // Kullanıcı yönetimi tablosunu açıyoruz
  };

  const getStyleForUser = (userId) => {
    // Kullanıcıya özel dış renk atama
    const color = colorMap[userId] || "gray"; // Eğer tanımlı değilse gri rengi kullan
    return new Style({
      stroke: new Stroke({
        color: color, // Dış çizgi rengi kullanıcıya göre
        width: 2, // Çizgi kalınlığı
      }),
      fill: new Fill({
        color: "rgba(0, 0, 255, 0.3)", // İçi her zaman %30 şeffaf mavi (istenirse gri yapabilirsiniz)
      }),
    });
  };

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = new Map({
        target: mapElement.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          new VectorLayer({
            source: vectorSourceRef.current,
            style: (feature) => {
              const userId = feature.get("userId");
              return getStyleForUser(userId); // Kullanıcıya göre stil atama
            },
          }),
        ],
        view: new View({
          center: fromLonLat([35.2433, 39.0668]),
          zoom: 6,
        }),
      });

      // Popup Overlay
      overlayRef.current = new Overlay({
        element: document.getElementById("popup"),
        positioning: "bottom-center",
        stopEvent: false,
        offset: [0, -15],
      });
      mapRef.current.addOverlay(overlayRef.current);

      // Haritaya tıklama olayı ekleyelim
      mapRef.current.on("singleclick", function (event) {
        const feature = mapRef.current.forEachFeatureAtPixel(
          event.pixel,
          function (feat) {
            return feat;
          }
        );

        if (feature) {
          const geometry = feature.getGeometry();
          let coordinates;

          if (geometry.getType() === "Point") {
            coordinates = geometry.getCoordinates(); // Nokta geometrisi
          } else {
            coordinates = geometry.getInteriorPoint().getCoordinates(); // Diğer geometriler
          }

          const name = feature.get("name");
          const userId = feature.get("userId");

          // Kullanıcı bilgilerini `userId` ile buluyoruz
          const user = users.find((u) => u.id === userId); // Doğru kullanıcıyı buluyoruz
          const userName = user ? user.username : "Bilinmiyor"; // Eşleşen kullanıcı varsa adı, yoksa 'Bilinmiyor'

          const wktFormat = new WKT().writeGeometry(geometry);

          const content = `
            <div class="popup-content">
              <p><strong>ID:</strong> ${feature.getId()}</p>
              <p><strong>İsim:</strong> ${name}</p>
              <p><strong>Sahip:</strong> ${userName}</p> <!-- Kullanıcı adı -->
              <div class="wkt-container">
                <textarea readonly rows="4">${wktFormat}</textarea>
              </div>
              <div class="popup-buttons">
                <button id="update-button" class="popup-button update-button">
                  <i class="fa fa-pencil"></i> Güncelle
                </button>
                <button id="delete-button" class="popup-button delete-button">
                  <i class="fa fa-trash"></i> Sil
                </button>
                <button id="close-button" class="popup-button close-button">
                  <i class="fa fa-times"></i> Kapat
                </button>
              </div>
            </div>
          `;

          overlayRef.current.getElement().innerHTML = content;
          overlayRef.current.setPosition(coordinates);

          // Yakınlaştırma işlemi
          if (geometry.getType() === "Point") {
            mapRef.current.getView().setCenter(coordinates);
            mapRef.current.getView().setZoom(15); // Yakınlaştır
          } else {
            const extent = geometry.getExtent();
            mapRef.current
              .getView()
              .fit(extent, { duration: 1000, maxZoom: 15 }); // Extent'i fit ediyoruz
          }

          // Buton event'leri
          document.getElementById("update-button").onclick = () => {
            handleUpdate({
              id: feature.getId(),
              name: feature.get("name"),
              wkt: new WKT().writeGeometry(geometry),
            });
            overlayRef.current.setPosition(undefined);
          };
          document.getElementById("delete-button").onclick = () => {
            handleDelete(feature.getId());
            overlayRef.current.setPosition(undefined);
          };
          document.getElementById("close-button").onclick = () => {
            overlayRef.current.setPosition(undefined);
          };
        } else {
          overlayRef.current.setPosition(undefined);
        }
      });

      fetchGeometriesFromDatabase(); // Geometrileri veritabanından çek
    }
  }, [users]); // `users` listesi değiştiğinde güncellenir

  useEffect(() => {
    console.log("Test Log: useEffect çalıştı."); // Basit test logu ekleyin
    const storedUserName = localStorage.getItem("username");
    console.log("Kayıtlı Kullanıcı Adı (localStorage):", storedUserName); // Log ekliyoruz

    if (storedUserName && storedUserName !== "undefined") {
      setUserName(storedUserName);
      console.log("State'e atanan kullanıcı adı:", storedUserName); // Log ekliyoruz
    } else {
      console.error("localStorage'da kullanıcı adı bulunamadı veya geçersiz.");
    }
  }, []);

  const token = localStorage.getItem("jwtToken");
  let isAdmin = false;

  if (token) {
    const decodedToken = jwtDecode(token); // Token'ı çözümle
    console.log("Decoded Token:", decodedToken); // Token'daki tüm bilgileri logla

    // Rol bilgisini alıyoruz
    const userRole =
      decodedToken[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ];
    console.log("Kullanıcı Rolü:", userRole); // Rol bilgisini logla

    // Eğer kullanıcı rolü 'Admin' ise isAdmin true olur
    isAdmin = userRole === "Admin";
    console.log("isAdmin durumu:", isAdmin); // isAdmin'in doğru olup olmadığını kontrol et
  }

  const fetchGeometriesFromDatabase = async () => {
    try {
      const token = localStorage.getItem("jwtToken");

      if (!token) {
        console.error("JWT token bulunamadı. Lütfen giriş yapın.");
        message.error("JWT token bulunamadı. Lütfen giriş yapın.");
        return;
      }

      const response = await fetch("https://localhost:7072/api/Point", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (!response.ok) {
        console.error("API isteği başarısız:", response.statusText);
        message.error(`API isteği başarısız: ${response.statusText}`);
        return;
      }

      const result = await response.json();

      if (!result || !result.data || result.data.length === 0) {
        message.info("Veritabanında kayıtlı geometri yok.");
        return;
      }

      const wktFormat = new WKT();
      let overallExtent = null;

      result.data.forEach((geoData) => {
        const feature = wktFormat.readFeature(geoData.wkt, {
          dataProjection: "EPSG:3857",
          featureProjection: "EPSG:3857",
        });

        if (!feature) {
          console.error(`Geometri oluşturulamadı: ${geoData.name}`);
          return;
        }

        feature.setId(geoData.id);
        feature.set("name", geoData.name);
        feature.set("userId", geoData.userId); // userId'yi geometriye ekliyoruz

        vectorSourceRef.current.addFeature(feature);
      });

      if (overallExtent) {
        mapRef.current
          .getView()
          .fit(overallExtent, { duration: 1000, maxZoom: 6 });
      }
    } catch (error) {
      console.error("Veritabanından veriler alınırken bir hata oluştu:", error);
      message.error("Veritabanından veriler alınırken bir hata oluştu.");
    }
  };

  const fetchData = async () => {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
      console.error("JWT token bulunamadı, lütfen giriş yapın.");
      return;
    }

    try {
      const response = await fetch("https://localhost:7072/api/Point", {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error("Yetkilendirme hatası. Lütfen giriş yapın.");
        } else {
          console.error("Veri çekme hatası:", response.status);
        }
        return;
      }

      const result = await response.json();
      console.log("Veriler başarıyla alındı:", result);

      // Gelen verilerin yapısını doğru şekilde kullanıyoruz
      if (result && result.data) {
        setData(result.data); // API'den gelen veriyi tabloya set ediyoruz
        console.log("Tabloya aktarılacak veriler:", result.data);
      } else {
        console.error("Beklenen veri formatı alınamadı.");
      }
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    }
  };
  const resetMapView = () => {
    mapRef.current.getView().setCenter(fromLonLat([35.2433, 39.0668]));
    mapRef.current.getView().setZoom(6);
  };

  const handleShowOnMap = (record) => {
    const feature = vectorSourceRef.current
      .getFeatures()
      .find((f) => f.getId() === record.id);

    if (feature) {
      const geometry = feature.getGeometry();

      if (!geometry) {
        message.error("Geometri bulunamadı veya geçersiz.");
        return;
      }

      // Geometrinin extent'ini alıyoruz
      const extent = geometry.getExtent();

      // WKT formatında geometrinin verisini alıyoruz
      const wktFormat = new WKT().writeGeometry(geometry);

      const content = `
<div class="popup-content">
  <p><strong>ID:</strong> ${record.id}</p>
  <p><strong>İsim:</strong> ${record.name}</p>
  <p><strong>WKT:</strong></p>
  <textarea readonly style="width: 100%; height: 80px;">${wktFormat}</textarea>
  <div class="popup-buttons">
    <button id="update-button" class="popup-button update-button" title="Güncelle">
      <i class="fa fa-pencil"></i>
    </button>
    <button id="delete-button" class="popup-button delete-button" title="Sil">
      <i class="fa fa-trash"></i>
    </button>
    <button id="close-button" class="popup-button close-button" title="Kapat">
      <i class="fa fa-times"></i>
    </button>
  </div>
</div>
`;

      // Popup'a içeriği atıyoruz
      overlayRef.current.getElement().innerHTML = content;

      // Popup'ı geometri üzerinde gösteriyoruz
      const coordinates = geometry.getInteriorPoint().getCoordinates();
      overlayRef.current.setPosition(coordinates);

      // Modal'ı (veriler tablosunu) kapatıyoruz
      setVisible(false);

      // Buton event'lerini ekliyoruz
      document.getElementById("update-button").onclick = () => {
        handleUpdate(record); // Güncelle fonksiyonu
        overlayRef.current.setPosition(undefined); // Popup'ı kapat
      };
      document.getElementById("delete-button").onclick = () => {
        handleDelete(record.id); // Silme fonksiyonu
        resetMapView(); // Haritayı eski haline döndür
        overlayRef.current.setPosition(undefined); // Popup'ı kapat
      };
      document.getElementById("close-button").onclick = () => {
        resetMapView(); // Haritayı eski haline döndür
        overlayRef.current.setPosition(undefined); // Popup'ı kapat
      };

      // Haritayı geometriyi gösterecek şekilde fit ediyoruz
      mapRef.current.getView().fit(extent, { duration: 1000, maxZoom: 14 });
    } else {
      message.error("Geometri bulunamadı.");
    }
  };

  const addDrawInteraction = (type) => {
    if (!mapRef.current) {
      return;
    }

    if (draw) {
      mapRef.current.removeInteraction(draw);
    }

    const newDraw = new Draw({
      source: vectorSourceRef.current,
      type: type,
    });
    newDraw.on("drawend", (event) => {
      const feature = event.feature;
      const wktFormat = new WKT().writeFeature(feature);

      MySwal.fire({
        title: <strong>Geometri Kaydet</strong>,
        html: (
          <div>
            <div style={{ marginBottom: "15px" }}>
              <label htmlFor="wkt">WKT Formatı:</label>
              <textarea
                id="wkt"
                className="swal2-textarea"
                style={{ height: "100px" }}
                readOnly
                value={wktFormat}
              />
            </div>
            <div>
              <label htmlFor="name">İsim:</label>
              <input
                id="name"
                className="swal2-input"
                placeholder="Geometri ismi girin"
              />
            </div>
          </div>
        ),
        confirmButtonText: "Kaydet",
        showCancelButton: true,
        cancelButtonText: "İptal",
        customClass: {
          popup: "popup-custom-class",
        },
        preConfirm: () => {
          const name = document.getElementById("name").value;
          if (!name) {
            Swal.showValidationMessage("Lütfen bir isim girin.");
            return false;
          }
          return { name, wktFormat };
        },
      }).then((result) => {
        if (result.isConfirmed) {
          const { name, wktFormat } = result.value;

          // Geometriye isim ekleyin ve loglayın
          feature.set("name", name);
          console.log("Oluşturulan geometrinin ismi:", feature.get("name"));

          saveGeometry(wktFormat, name);
        }
      });
    });

    mapRef.current.addInteraction(newDraw);
    setDraw(newDraw);
  };

  const saveGeometry = async (geometry, name) => {
    const token = localStorage.getItem("jwtToken"); // Token'ı alıyoruz

    if (!token) {
      console.error("JWT token bulunamadı, lütfen giriş yapın.");
      return;
    }

    const userId = "kullanıcıId'si"; // JWT token'dan UserId'yi alın (isteğe bağlı, backend buna ihtiyaç duyabilir)

    const requestBody = {
      WKT: geometry, // Geometri verisi
      Name: name, // Geometri adı
      UserId: userId, // Kullanıcı ID'si (eğer zorunluysa)
    };

    try {
      const response = await fetch("https://localhost:7072/api/Point", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token, // JWT token ekleniyor
        },
        body: JSON.stringify(requestBody), // Gönderilen veri JSON formatında
      });

      if (!response.ok) {
        if (response.status === 400) {
          console.error(
            "Sunucuya gönderilen istek hatalı. Lütfen gönderilen veriyi kontrol edin."
          );
        } else if (response.status === 401) {
          console.error("Yetkilendirme hatası. Lütfen giriş yapın.");
        } else {
          console.error("Veri kaydedilirken bir hata oluştu.");
        }
      } else {
        console.log("Veri başarıyla kaydedildi.");
      }
    } catch (error) {
      console.error("Veri kaydedilirken bir hata oluştu.", error);
    }
  };

  const handleUpdate = (record) => {
    Swal.fire({
      title: "Güncelleme Seçeneği",
      text: "Lütfen bir güncelleme yöntemi seçin.",
      showCancelButton: true,
      confirmButtonText: "Panel Üzerinden Güncelleme",
      cancelButtonText: "Manuel Güncelleme",
      showCloseButton: true,
      focusConfirm: false,
      focusCancel: true,
    }).then((result) => {
      if (result.isConfirmed) {
        showPanelUpdate(record);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        showManualUpdate(record);
      }
    });
  };
  const showDrawer = () => {
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
  };

  const showManualUpdate = (record) => {
    const feature = vectorSourceRef.current
      .getFeatures()
      .find((f) => f.getId() === record.id);

    if (feature) {
      const select = new Select({
        features: new Collection([feature]),
      });
      const modify = new Modify({ features: select.getFeatures() });
      const translate = new Translate({ features: select.getFeatures() });

      mapRef.current.addInteraction(select);
      mapRef.current.addInteraction(modify);
      mapRef.current.addInteraction(translate);

      // Sağ üstte "Kaydet" butonu oluştur
      const saveButton = document.createElement("button");
      saveButton.innerText = "Kaydet";
      saveButton.id = "saveButton";
      saveButton.style.position = "absolute";
      saveButton.style.top = "10px";
      saveButton.style.right = "10px";
      saveButton.style.zIndex = 1000;
      saveButton.style.padding = "10px 20px";
      saveButton.style.backgroundColor = "#28a745";
      saveButton.style.color = "white";
      saveButton.style.border = "none";
      saveButton.style.borderRadius = "5px";
      saveButton.style.cursor = "pointer";

      // "Kaydet" butonuna tıklanınca düzenlemeyi tamamla
      saveButton.onclick = () =>
        finishInteraction(feature, record, modify, translate, select);
      document.body.appendChild(saveButton);
    } else {
      message.error("Geometri bulunamadı.");
    }
  };
  const handlePasswordModalCancel = () => {
    setIsPasswordModalVisible(false); // Modalı kapat
    setNewPassword(""); // Şifre inputunu temizle
  };
  const handleUserPasswordChange = (user) => {
    setSelectedUser(user); // Seçili kullanıcıyı state'e kaydediyoruz
    setIsPasswordModalVisible(true); // Şifre güncelleme modalını aç
  };
  const handlePasswordUpdate = async () => {
    if (!newPassword) {
      message.error("Lütfen bir şifre girin!");
      return;
    }

    try {
      // Şifreyi hashliyoruz
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // JWT token'ı alıyoruz
      const token = localStorage.getItem("jwtToken");

      // Backend'e PUT isteği atıyoruz
      const response = await fetch(
        `https://localhost:7072/api/users/${selectedUser.id}/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newPassword: hashedPassword }), // Hashlenmiş şifreyi gönderiyoruz
        }
      );

      if (response.ok) {
        message.success("Şifre başarıyla güncellendi.");
        setIsPasswordModalVisible(false); // Modalı kapatıyoruz
        setNewPassword(""); // Şifreyi temizliyoruz
      } else {
        message.error("Şifre güncelleme sırasında hata oluştu.");
      }
    } catch (error) {
      message.error("Şifre güncellenirken bir hata oluştu.");
    }
  };
  const handleUserDelete = async (userId) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await fetch(
        `https://localhost:7072/api/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        message.success("Kullanıcı başarıyla silindi.");
        fetchUsers(); // Kullanıcıları tekrar yükle
      } else {
        message.error("Kullanıcı silinirken bir hata oluştu.");
      }
    } catch (error) {
      message.error("Kullanıcı silinirken bir hata oluştu.");
    }
  };

  // Modal onOk fonksiyonu: Yeni rolü backend'e gönderir
  const handleRoleChange = async () => {
    const token = localStorage.getItem("jwtToken");

    try {
      const response = await fetch(
        `https://localhost:7072/api/users/${selectedUser.id}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }), // Yeni rolü gönderiyoruz
        }
      );

      if (response.ok) {
        message.success("Rol başarıyla güncellendi.");
        setIsRoleModalVisible(false); // Modalı kapat
        setNewRole(""); // Rol inputunu temizle
      } else {
        message.error("Rol güncelleme sırasında hata oluştu.");
      }
    } catch (error) {
      message.error("Rol güncellenirken bir hata oluştu.");
    }
  };

  // Modal iptal fonksiyonu
  const handleRoleModalCancel = () => {
    setIsRoleModalVisible(false); // Modalı kapat
    setNewRole(""); // Rol inputunu temizle
  };

  // Düzenlemeyi bitir ve yeni ismi alarak güncellemeyi kaydet
  const finishInteraction = (feature, record, modify, translate, select) => {
    mapRef.current.removeInteraction(modify);
    mapRef.current.removeInteraction(translate);
    mapRef.current.removeInteraction(select);

    const wktFormat = new WKT().writeFeature(feature); // Geometriyi WKT formatına çevir

    // Swal ile yeni isim al ve kaydet
    MySwal.fire({
      title: "Güncelleme Tamamlandı",
      html: `
        <div>
          <label htmlFor="name">Yeni İsim:</label>
          <input id="name" class="swal2-input" placeholder="Geometri ismi girin" value="${record.name}" />
        </div>
      `,
      confirmButtonText: "Güncelle",
      showCancelButton: true,
      cancelButtonText: "İptal",
      preConfirm: () => {
        const name = document.getElementById("name").value;
        if (!name) {
          Swal.showValidationMessage("Lütfen bir isim girin.");
          return false;
        }
        return { name };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedData = {
          ...record,
          name: result.value.name,
          wkt: wktFormat,
        };

        // Geometriyi kaydet
        saveUpdatedGeometry(updatedData);

        MySwal.fire({
          icon: "success",
          title: "İşlem Tamamlandı",
          text: "Geometri başarıyla güncellendi.",
          confirmButtonText: "Tamam",
        });
      }

      // "Kaydet" butonunu kaldır
      const saveButton = document.getElementById("saveButton");
      if (saveButton) {
        saveButton.remove();
      }
    });
  };

  const handleGeometryClick = () => {
    setSubMenuOpen(!subMenuOpen); // Submenu'yi açıp kapat
  };

  const showPanelUpdate = (record) => {
    MySwal.fire({
      title: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i
            className="fa fa-pencil"
            style={{ marginRight: "10px", fontSize: "24px", color: "#007bff" }}
          ></i>
          <strong>Geometri Güncelleme</strong>
        </div>
      ),
      html: (
        <div>
          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="wkt"
              style={{
                fontWeight: "bold",
                display: "block",
                marginBottom: "5px",
              }}
            >
              WKT Formatı:
            </label>
            <textarea
              id="wkt"
              className="swal2-textarea"
              style={{ height: "100px", resize: "none", width: "100%" }}
              readOnly
              value={record.wkt}
            />
          </div>
          <div>
            <label
              htmlFor="name"
              style={{
                fontWeight: "bold",
                display: "block",
                marginBottom: "5px",
              }}
            >
              İsim:
            </label>
            <input
              id="name"
              className="swal2-input"
              placeholder="Geometri ismi girin"
              defaultValue={record.name}
              style={{ width: "100%" }}
            />
          </div>
        </div>
      ),
      confirmButtonText: "Güncelle",
      showCancelButton: true,
      cancelButtonText: "İptal",
      customClass: {
        popup: "popup-custom-class",
      },
      preConfirm: () => {
        const name = document.getElementById("name").value;
        if (!name) {
          Swal.showValidationMessage("Lütfen bir isim girin.");
          return false;
        }
        return { name };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedData = {
          ...record,
          name: result.value.name,
        };
        saveUpdatedGeometry(updatedData);
      }
    });
  };

  const saveUpdatedGeometry = async (updatedData) => {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
      console.error("JWT token bulunamadı. Lütfen giriş yapın.");
      return;
    }

    try {
      const response = await fetch(
        `https://localhost:7072/api/Point/${updatedData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token, // JWT token'ı header'a ekliyoruz
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (response.ok) {
        message.success("Geometri başarıyla güncellendi.");
        fetchGeometriesFromDatabase(); // Verileri tekrar yüklüyoruz
      } else if (response.status === 401) {
        console.error("Yetkilendirme hatası: Lütfen giriş yapın.");
        message.error("Yetkilendirme hatası: Lütfen giriş yapın.");
      } else {
        message.error("Güncelleme sırasında bir hata oluştu.");
      }
    } catch (error) {
      message.error("Güncelleme işlemi sırasında bir hata oluştu.");
      console.error("Güncelleme işlemi hatası:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("jwtToken"); // Token alıyoruz
      const response = await fetch(`https://localhost:7072/api/Point/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token, // JWT Token ekliyoruz
        },
      });

      if (response.ok) {
        message.success("Kayıt başarıyla silindi.");

        // Vektör kaynağından feature'ı sil
        const featureToRemove = vectorSourceRef.current
          .getFeatures()
          .find((feature) => feature.getId() === id);

        if (featureToRemove) {
          vectorSourceRef.current.removeFeature(featureToRemove);
        }

        // UI'dan (tablo) kaydı sil
        setData((prevData) => prevData.filter((item) => item.id !== id));
      } else {
        message.error("Kayıt silinirken bir hata oluştu.");
      }
    } catch (error) {
      message.error("Silme işlemi sırasında bir hata oluştu.");
    }
  };

  const handleSearch = (event) => {
    const searchText = event.target.value.toLowerCase();

    if (searchText.length === 0) {
      console.log("Arama kutusu boş, harita eski haline döndürülüyor.");
      mapRef.current.getView().setCenter(fromLonLat([35.2433, 39.0668]));
      mapRef.current.getView().setZoom(6);
      overlayRef.current.setPosition(undefined);
      return;
    }

    if (searchText.length < 3) {
      console.log("Arama yapmak için daha fazla karakter girin.");
      return;
    }

    console.log("Aranan metin:", searchText);

    const matchedFeature = vectorSourceRef.current
      .getFeatures()
      .find((feature) => {
        const featureName = feature.get("name");
        console.log("Feature adı:", featureName);
        return featureName && featureName.toLowerCase().includes(searchText);
      });

    if (matchedFeature) {
      const geometry = matchedFeature.getGeometry();
      const extent = geometry.getExtent();
      mapRef.current.getView().fit(extent, { duration: 1000, maxZoom: 15 });

      const content = `
        <div class="popup-content">
          <p><strong>ID:</strong> ${matchedFeature.getId()}</p>
          <p><strong>İsim:</strong> ${matchedFeature.get("name")}</p>
          <div class="wkt-container">
            <textarea readonly rows="4">${new WKT().writeGeometry(
              geometry
            )}</textarea>
          </div>
          <div class="popup-buttons">
            <button id="update-button" class="popup-button update-button">
              <i class="fa fa-pencil"></i> Güncelle
            </button>
            <button id="delete-button" class="popup-button delete-button">
              <i class="fa fa-trash"></i> Sil
            </button>
            <button id="close-button" class="popup-button close-button">
              <i class="fa fa-times"></i> Kapat
            </button>
          </div>
        </div>
      `;

      overlayRef.current.getElement().innerHTML = content;
      overlayRef.current.setPosition(
        geometry.getInteriorPoint().getCoordinates()
      );

      document.getElementById("update-button").onclick = () => {
        handleUpdate({
          id: matchedFeature.getId(),
          name: matchedFeature.get("name"),
          wkt: new WKT().writeGeometry(geometry),
        });
        overlayRef.current.setPosition(undefined);
      };
      document.getElementById("delete-button").onclick = () => {
        handleDelete(matchedFeature.getId());
        overlayRef.current.setPosition(undefined);
      };
      document.getElementById("close-button").onclick = () => {
        overlayRef.current.setPosition(undefined);
      };
    } else {
      console.log("Eşleşme bulunamadı.");
      message.error("Arama sonucuna uygun geometri bulunamadı.");
    }
  };

  const menu = (record) => (
    <Menu>
      <Menu.Item
        key="1"
        icon={<EyeOutlined style={{ color: "#007bff" }} />} // Mavi renk
        onClick={() => handleShowOnMap(record)}
      >
        Görüntüle
      </Menu.Item>

      <Menu.Item
        key="2"
        icon={<EditOutlined style={{ color: "#28a745" }} />} // Yeşil renk
        onClick={() => handleUpdate(record)}
      >
        Güncelle
      </Menu.Item>

      <Menu.Item
        key="3"
        icon={<DeleteOutlined style={{ color: "#dc3545" }} />} // Kırmızı renk
        onClick={() => handleDelete(record.id)}
      >
        Sil
      </Menu.Item>

      <Menu.Item
        key="4"
        icon={<CloseOutlined style={{ color: "#ffc107" }} />} // Sarı renk
      >
        Kapat
      </Menu.Item>
    </Menu>
  );
  console.log("Tablo oluşturulmadan önce isAdmin durumu:", isAdmin);

  const userscolumns = [
    {
      title: "Kullanıcı Adı",
      dataIndex: "username",
      key: "username",
      render: (text) => (
        <span style={{ color: colorMap[text] }}>{text}</span> // Renk ekleniyor
      ),
    },
    {
      title: "Rol",
      dataIndex: "role",
      key: "role",
    },

    {
      title: "İşlemler",
      key: "actions",
      render: (text, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item onClick={() => handleRoleUpdate(record)}>
                <i
                  className="fa fa-id-badge"
                  style={{ marginRight: 8, color: "green" }}
                />{" "}
                Rol Güncelle
              </Menu.Item>
              <Menu.Item onClick={() => handleUserDelete(record.id)}>
                <i
                  className="fa fa-trash"
                  style={{ marginRight: 8, color: "red" }}
                />{" "}
                Sil
              </Menu.Item>
            </Menu>
          }
        >
          <a onClick={(e) => e.preventDefault()} className="ellipsis-menu">
            <i className="fa fa-ellipsis-h"></i>
          </a>
        </Dropdown>
      ),
    },
  ];

  // Kolonların tanımı
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ellipsis: true, // Uzun metinleri kes
    },
    {
      title: "WKT",
      dataIndex: "wkt",
      key: "wkt",
      render: (text) => (
        <Tooltip title={text}>
          <div
            style={{
              maxWidth: "150px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {text}
          </div>
        </Tooltip>
      ),
    },
    isAdmin && {
      // Sadece admin için Owner kolonu
      title: "Owner",
      dataIndex: "userId", // UserId bilgisini owner olarak gösteriyoruz
      key: "owner",
      render: (owner) => <span>{owner}</span>, // Sahip bilgisi
      width: 120, // Sabit genişlik
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Dropdown overlay={menu(record)} trigger={["click"]}>
          <a onClick={(e) => e.preventDefault()} className="ellipsis-menu">
            <i className="fa fa-ellipsis-h"></i>
          </a>
        </Dropdown>
      ),
    },
  ].filter(Boolean); // False olan kolonları çıkarır (isAdmin true değilse Owner kolonu görünmez)
  return (
    <div className="map-container">
      <div
        ref={mapElement}
        id="map"
        style={{ width: "100%", height: "100vh" }}
      ></div>

      <div className="menu-container">
        <div className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>
          &#9776;
        </div>
        <div className={`search-box ${menuOpen ? "open" : ""}`}>
          <i className="fa fa-search search-icon"></i>
          <input
            type="text"
            placeholder="Haritada Ara"
            className="search-input"
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className={`menu-items ${menuOpen ? "open" : ""}`}>
        <div className="menu-header">
          <img src={logo} alt="Logo" />
          <button className="menu-close" onClick={() => setMenuOpen(false)}>
            &times;
          </button>
        </div>

        <button className="menu-item" onClick={handleProfileClick}>
          <i className="fa fa-user-circle"></i>
          Profil
        </button>
        {profileMenuOpen && (
          <div className="profile-dropdown">
            <p>
              <strong>Kullanıcı:</strong> {userName}{" "}
              {/* Burada kullanıcı adı gösteriliyor */}
            </p>
            <button onClick={handleLogout} className="logout-button">
              <LogoutOutlined /> Çıkış Yap
            </button>
          </div>
        )}

        {/* Geometry alt menüsü */}
        <button className="menu-item" onClick={handleGeometryClick}>
          <i className="fa fa-map-marker"></i>
          Geometry
        </button>

        {subMenuOpen && (
          <div className="sub-menu">
            <button
              className="menu-item"
              onClick={() => addDrawInteraction("Point")}
            >
              <i className="fa fa-map-marker"></i> Point
            </button>
            <button
              className="menu-item"
              onClick={() => addDrawInteraction("LineString")}
            >
              <i className="fa fa-long-arrow-right"></i> LineString
            </button>
            <button
              className="menu-item"
              onClick={() => addDrawInteraction("Polygon")}
            >
              <i className="fa fa-object-ungroup"></i> Polygon
            </button>
          </div>
        )}

        <button
          className="menu-item"
          onClick={() => {
            fetchData();
            setVisible(true);
            setMenuOpen(false); // Menü kapanıyor
          }}
        >
          <i className="fa fa-search"></i>
          Veriler
        </button>

        {/* Admin Menüsü */}
        {isAdmin && (
          <>
            <button
              className="menu-item"
              onClick={() => setAdminMenuOpen(!adminMenuOpen)}
            >
              <i className="fa fa-shield"></i>
              Yönetim Paneli
            </button>

            {/* Admin alt menüsü Geometry gibi açılır/kapanır */}
            {adminMenuOpen && (
              <div className="sub-menu">
                <button
                  className="menu-item"
                  onClick={() => setUserManagementVisible(true)}
                >
                  <i className="fa fa-users"></i> Kullanıcı Yönetimi
                </button>

                {/* Dashboard butonu */}
                <button className="menu-item" onClick={openDashboard}>
                  <i className="fas fa-chart-pie"></i> Dashboard
                </button>

                {/* Talepler butonu */}
                <button
                  className="menu-item"
                  onClick={() => setIsTaleplerVisible(true)} // Talepler tablosunu gösterir
                >
                  <i className="fa fa-lock"></i> Talepler
                </button>
              </div>
            )}

            {/* Talepler tablosu */}
            <TaleplerTable
              isVisible={isTaleplerVisible}
              onClose={hideTalepler}
            />
          </>
        )}
      </div>
      <Modal
        title="Kullanıcı Yönetimi"
        visible={userManagementVisible}
        onCancel={() => setUserManagementVisible(false)}
        footer={null} // Alt kısımda butonları iptal ediyoruz
        width="80%" // Genişliği istediğin şekilde ayarlayabilirsin
      >
        {/* Tablonun burada gösterileceği yer */}
        <Table
          dataSource={users} // API'den çekilen kullanıcı verilerini burada gösteriyoruz
          columns={userscolumns} // Kolonlar (Kullanıcı adı, email, işlemler vs.)
          rowKey="id" // Benzersiz ID
          pagination={{ pageSize: 5 }} // Sayfalama ayarı
          bordered // Çerçeve görünümü ekler
        />
      </Modal>

      <Modal
        title="Veriler"
        open={visible} // visible state'ine bağlı olarak modal açılıyor
        onCancel={() => {
          setVisible(false); // Modal kapatma işlemi
          setMenuOpen(true); // Menü tekrar açılıyor
        }}
        footer={null} // Modal altındaki default butonları kaldırıyoruz
        width="90%" // Modal genişliği
        style={{ top: 20 }} // Modal'ın üstten uzaklığı
        bodyStyle={{ height: "80vh", overflowY: "auto" }} // Modal içeriğinin stili
      >
        <Table
          dataSource={data} // Data state'inden gelen veriyi tabloya bağlama
          columns={columns} // Kolonlar doğru ayarlanmış mı kontrol edin
          rowKey="id" // Benzersiz bir rowKey tanımlandığından emin olun
          pagination={{ pageSize: 5 }} // Sayfalama ayarını yapalım
          bordered // Çerçeve görünümü ekler
        />
      </Modal>

      <Modal
        title="Rol Güncelle"
        visible={isRoleModalVisible}
        onOk={handleRoleChange} // Rol güncelleme işlemi
        onCancel={handleRoleModalCancel} // Modalı kapatma
      >
        <p>Kullanıcı: {selectedUser?.username}</p>
        <Input
          placeholder="Yeni rolü girin"
          value={newRole} // Yeni rol inputu
          onChange={(e) => setNewRole(e.target.value)} // Rol değişimini takip et
        />
      </Modal>
      <Modal
        title="Şifre Güncelle"
        visible={isPasswordModalVisible}
        onOk={handlePasswordUpdate} // Şifreyi güncelleme işlemi
        onCancel={handlePasswordModalCancel} // Modalı iptal etme işlemi
      >
        {/* Kullanıcı adı modal içinde gösteriliyor */}
        <p>Kullanıcı Adı: {selectedUser?.username}</p>

        <p>Lütfen yeni şifreyi giriniz:</p>
        <Input.Password
          placeholder="Yeni şifre"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)} // Şifreyi state'e kaydet
        />
      </Modal>
      <Modal
        title="Dashboard"
        visible={isDashboardVisible}
        onCancel={handleDashboardCancel}
        footer={null}
      >
        {Array.isArray(dashboardData) && dashboardData.length > 0 ? (
          <PieChart width={400} height={300}>
            <Pie
              data={dashboardData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {dashboardData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        ) : (
          <p>Dashboard verisi bulunamadı.</p>
        )}
      </Modal>

      <div id="popup" className="ol-popup"></div>
    </div>
  );
};

export default MapComponent;
