import { useEffect, useState } from "react";
import { Spin, Row, Col, Button, Drawer, Table, Modal, Dropdown } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import ErrorContent from "../../../../../../../components/common/ErrorContent";
import FormMaintenance from "./components/FormMaintenance";

import http from "../../../../../../../services/httpService";

import { getColumnSearchProps } from "../../../../../../../helpers/TableFilterProps";

function Maintenances({ serialNumber, onChange }) {
  const [maintenances, setMaintenances] = useState([]);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);

  const [isFormCreateMaintenanceOpen, setIsFormCreateMaintenanceOpen] =
    useState(false);
  const [isFormUpdateMaintenanceOpen, setIsFormUpdateMaintenanceOpen] =
    useState(false);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const getMaintenances = async () => {
    const { data } = await http.get(`/api/maintenanceRecords/${serialNumber}`);
    setMaintenances(data);
  };

  useEffect(() => {
    const fetchMaintenances = async () => {
      try {
        setIsContentLoading(true);
        await getMaintenances();
      } catch (error) {
        setErrorMsg(error.message || "Something went wrong!");
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchMaintenances();
  }, []);

  if (errorMsg) {
    return <ErrorContent errorMessage={errorMsg} />;
  }

  const toggleFormCreateMaintenanceOpen = () => {
    setIsFormCreateMaintenanceOpen(!isFormCreateMaintenanceOpen);
  };

  const toggleFormUpdateMaintenanceOpen = () => {
    setIsFormUpdateMaintenanceOpen(!isFormUpdateMaintenanceOpen);
  };

  const handleFormCreateMaintenanceSubmit = async (formData) => {
    try {
      toggleFormCreateMaintenanceOpen();
      setIsContentLoading(true);
      await http.post("/api/maintenanceRecords", {
        ...formData,
        serial_number: serialNumber,
      });
      await getMaintenances();
      onChange();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleFormUpdateMaintenanceSubmit = async (formData) => {
    try {
      toggleFormUpdateMaintenanceOpen();
      setIsContentLoading(true);
      await http.put(`/api/maintenanceRecords/${selectedMaintenance.id}`, {
        ...formData,
        serial_number: serialNumber,
      });
      await getMaintenances();
      onChange();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleDeleteMaintenance = async (maintenance) => {
    try {
      setIsContentLoading(true);
      await http.delete(`/api/maintenanceRecords/${maintenance.id}`);
      await getMaintenances();
      onChange();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const tableColumns = [
    {
      title: "Maintenance Date",
      dataIndex: "maintenance_date",
    },

    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Performed By",
      dataIndex: "performed_by",
    },
    {
      title: "Next Maintenance Date",
      dataIndex: "next_maintenance_date",
    },
    {
      title: "Action",
      width: 50,
      render: (_, record) => {
        const menuItems = [
          { key: "Update", label: "Update" },
          {
            type: "divider",
          },
          { key: "Delete", label: "Delete", danger: true },
        ];

        const handleMenuClick = ({ key }) => {
          if (key === "Update") {
            setSelectedMaintenance(record);
            toggleFormUpdateMaintenanceOpen();
          } else if (key === "Delete") {
            Modal.confirm({
              title: "Delete Maintenance",
              content: "Are you sure you want to delete this maintenance?",
              onOk: async () => {
                handleDeleteMaintenance(record);
              },
            });
          }
        };

        return (
          <Dropdown
            menu={{ items: menuItems, onClick: handleMenuClick }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button shape="circle" onClick={(e) => e.stopPropagation()}>
              <MoreOutlined />
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <>
      <Spin spinning={isContentLoading} tip="loading ...">
        <Row type="flex" justify="space-between" style={{ marginBottom: 16 }}>
          <Col></Col>
          <Col>
            <Button type="primary" onClick={toggleFormCreateMaintenanceOpen}>
              Create Maintenance
            </Button>
          </Col>
        </Row>
        <Table columns={tableColumns} dataSource={maintenances} rowKey="id" />
      </Spin>

      <Drawer
        title="Create Maintenance"
        open={isFormCreateMaintenanceOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormCreateMaintenanceOpen}
      >
        <FormMaintenance onSubmit={handleFormCreateMaintenanceSubmit} />
      </Drawer>

      <Drawer
        title="Update Maintenance"
        open={isFormUpdateMaintenanceOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormUpdateMaintenanceOpen}
      >
        <FormMaintenance
          formData={selectedMaintenance}
          onSubmit={handleFormUpdateMaintenanceSubmit}
        />
      </Drawer>
    </>
  );
}

export default Maintenances;
