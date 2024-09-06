import React, { useState, useEffect, useRef } from "react";
import "./mapcomponent.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import { fromLonLat } from "ol/proj";
import Draw from "ol/interaction/Draw";
import Modify from "ol/interaction/Modify";
import { Table, Modal, Space, message } from "antd";
import "font-awesome/css/font-awesome.min.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import WKT from "ol/format/WKT";
import { Style, Stroke, Fill } from "ol/style";
import Translate from "ol/interaction/Translate";
import Select from "ol/interaction/Select";
import Collection from "ol/Collection";
import Overlay from "ol/Overlay";
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

const MySwal = withReactContent(Swal);

const MapComponent = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [subMenuOpen, setSubMenuOpen] = useState(false); // Submenu için state
  const [data, setData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [draw, setDraw] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const mapElement = useRef();
  const mapRef = useRef(null);
  const vectorSourceRef = useRef(new VectorSource());
  const overlayRef = useRef();

  const userInfo = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("username");
    window.location.reload(); // Sayfayı yenileyerek logout işlemini tamamlıyoruz
  };

  const handleProfileClick = () => {
    setProfileMenuOpen(!profileMenuOpen); // Profil menüsünü açıp kapatma
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
            style: new Style({
              stroke: new Stroke({
                color: "blue",
                width: 2,
              }),
              fill: new Fill({
                color: "rgba(0, 0, 255, 0.1)",
              }),
            }),
          }),
        ],
        view: new View({
          center: fromLonLat([35.2433, 39.0668]),
          zoom: 6,
        }),
      });

      fetchGeometriesFromDatabase();

      overlayRef.current = new Overlay({
        element: document.getElementById("popup"),
        positioning: "bottom-center",
        stopEvent: false,
        offset: [0, -15],
      });
      mapRef.current.addOverlay(overlayRef.current);
    }
  }, [data]);

  const fetchGeometriesFromDatabase = async () => {
    try {
      const token = localStorage.getItem("jwtToken"); // Token'ı localStorage'dan alıyoruz
      const response = await fetch("https://localhost:7072/api/Point", {
        headers: {
          Authorization: "Bearer " + token, // Token'ı header'a ekliyoruz
        },
      });

      const result = await response.json();

      if (result.value.length === 0) {
        return;
      }

      const wktFormat = new WKT();
      result.value.forEach((geoData) => {
        const feature = wktFormat.readFeature(geoData.wkt, {
          dataProjection: "EPSG:3857",
          featureProjection: "EPSG:3857",
        });

        if (feature) {
          feature.setId(geoData.id);
          feature.set("name", geoData.name); // Geometriye isim ekleniyor
          vectorSourceRef.current.addFeature(feature);
        }
      });

      setData(result.value);
    } catch (error) {
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

  const handleShowOnMap = (record) => {
    const feature = vectorSourceRef.current
      .getFeatures()
      .find((f) => f.getId() === record.id);

    if (feature) {
      const geometry = feature.getGeometry();

      const content = `
        <div class="popup-content">
          <p><strong>ID:</strong> ${record.id}</p>
          <p><strong>İsim:</strong> ${record.name}</p>
          <p><strong>WKT:</strong> ${record.wkt}</p>
        </div>
      `;

      overlayRef.current.getElement().innerHTML = content;
      overlayRef.current.setPosition(
        geometry.getInteriorPoint().getCoordinates()
      );

      const extent = feature.getGeometry().getExtent();
      mapRef.current.getView().fit(extent, { duration: 1000, maxZoom: 18 });
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
    try {
      const response = await fetch(
        `https://localhost:7072/api/Point/${updatedData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (response.ok) {
        message.success("Geometri başarıyla güncellendi.");
        fetchGeometriesFromDatabase();
      } else {
        message.error("Güncelleme sırasında bir hata oluştu.");
      }
    } catch (error) {
      message.error("Güncelleme işlemi sırasında bir hata oluştu.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://localhost:7072/api/Point/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        message.success("Kayıt başarıyla silindi.");
        setSuccessId(id);
        setData(data.filter((item) => item.id !== id));

        vectorSourceRef.current.clear();
        fetchGeometriesFromDatabase();
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
      mapRef.current.getView().fit(extent, { duration: 1000, maxZoom: 18 });

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
        icon={<EyeOutlined />}
        onClick={() => handleShowOnMap(record)}
      >
        Görüntüle
      </Menu.Item>

      <Menu.Item
        key="3"
        icon={<EditOutlined />}
        onClick={() => handleUpdate(record)}
      >
        Düzenle
      </Menu.Item>
      <Menu.Item
        key="4"
        icon={<DeleteOutlined />}
        onClick={() => handleDelete(record.id)}
      >
        Sil
      </Menu.Item>
      <Menu.Item key="5" icon={<CloseOutlined />}>
        Kapat
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: "Name",
      dataIndex: "name", // Verilerdeki "name" alanı
      key: "name",
      ellipsis: true, // Uzun metinler için taşma önleme
    },
    {
      title: "WKT",
      dataIndex: "wkt", // Verilerdeki "wkt" alanı
      key: "wkt",
      ellipsis: true, // Uzun metinler için taşma önleme
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
  ];

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
              <strong>Kullanıcı:</strong> {userInfo}
            </p>{" "}
            {/* Kullanıcı bilgisi */}
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
          }}
        >
          <i className="fa fa-search"></i>
          Query
        </button>

        <button className="menu-item menu-footer">
          <i className="fa fa-cog"></i>
          Ayarlar
        </button>
      </div>
      <Modal
        title="Veriler"
        open={visible} // visible state'ine bağlı olarak modal açılıyor
        onCancel={() => setVisible(false)} // Modal kapatma işlemi
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

      <div id="popup" className="ol-popup"></div>
    </div>
  );
};

export default MapComponent;
