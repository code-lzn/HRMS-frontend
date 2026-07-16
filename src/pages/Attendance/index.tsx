import { useState, useCallback } from 'react';
import { Card, Spin, message } from 'antd';
import { queryAttendanceUsingGet } from '@/api/hrAttendanceController';
import { useRequest } from '@umijs/max';
import dayjs from 'dayjs';
import FilterBar from './components/FilterBar';
import ActionBar from './components/ActionBar';
import AttendanceTable from './components/AttendanceTable';
import AddModal from './components/AddModal';
import DetailModal from './components/DetailModal';
import DeleteModal from './components/DeleteModal';

const Attendance: React.FC = () => {
  const [filterParams, setFilterParams] = useState({
    employeeName: '',
    employeeNo: '',
    departmentId: undefined,
    month: dayjs().format('YYYY-MM'),
    status: undefined,
    punchType: undefined,
    pageNum: 1,
    pageSize: 10,
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<API.HRAttendanceVO | null>(null);
  const [deleteIds, setDeleteIds] = useState<number[]>([]);

  const { data, loading, run } = useRequest(
    () => queryAttendanceUsingGet(filterParams).then((r) => r.data),
    {
      refreshOnWindowFocus: false,
      onError: () => message.error('获取考勤数据失败'),
    }
  );

  const handleFilterChange = useCallback((params: any) => {
    setFilterParams((prev) => ({ ...prev, ...params, pageNum: 1 }));
  }, []);

  const handleSearch = useCallback(() => {
    run();
  }, [run]);

  const handleReset = useCallback(() => {
    setFilterParams({
      employeeName: '',
      employeeNo: '',
      departmentId: undefined,
      month: dayjs().format('YYYY-MM'),
      status: undefined,
      punchType: undefined,
      pageNum: 1,
      pageSize: 10,
    });
  }, []);

  const handlePageChange = useCallback((pageNum: number, pageSize: number) => {
    setFilterParams((prev) => ({ ...prev, pageNum, pageSize }));
  }, []);

  const handleRowSelectionChange = useCallback((keys: number[]) => {
    setSelectedRowKeys(keys);
  }, []);

  const handleAdd = useCallback(() => {
    setCurrentRecord(null);
    setAddModalVisible(true);
  }, []);

  const handleEdit = useCallback((record: API.HRAttendanceVO) => {
    setCurrentRecord(record);
    setEditModalVisible(true);
  }, []);

  const handleDetail = useCallback((record: API.HRAttendanceVO) => {
    setCurrentRecord(record);
    setDetailModalVisible(true);
  }, []);

  const handleDelete = useCallback((id: number) => {
    setDeleteIds([id]);
    setDeleteModalVisible(true);
  }, []);

  const handleBatchDelete = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的记录');
      return;
    }
    setDeleteIds(selectedRowKeys);
    setDeleteModalVisible(true);
  }, [selectedRowKeys]);

  const handleSaveSuccess = useCallback(() => {
    setAddModalVisible(false);
    setEditModalVisible(false);
    setCurrentRecord(null);
    message.success('操作成功');
    run();
  }, [run]);

  const handleDeleteSuccess = useCallback(() => {
    setDeleteModalVisible(false);
    setDeleteIds([]);
    setSelectedRowKeys([]);
    message.success('删除成功');
    run();
  }, [run]);

  return (
    <div>
      <Spin spinning={loading}>
        <Card>
          <FilterBar
            params={filterParams}
            onChange={handleFilterChange}
            onSearch={handleSearch}
            onReset={handleReset}
          />

          <ActionBar
            selectedCount={selectedRowKeys.length}
            onAdd={handleAdd}
            onBatchDelete={handleBatchDelete}
          />

          <AttendanceTable
            data={data?.list || []}
            total={data?.total || 0}
            pageNum={filterParams.pageNum}
            pageSize={filterParams.pageSize}
            selectedRowKeys={selectedRowKeys}
            onPageChange={handlePageChange}
            onRowSelectionChange={handleRowSelectionChange}
            onEdit={handleEdit}
            onDetail={handleDetail}
            onDelete={handleDelete}
          />
        </Card>
      </Spin>

      <AddModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSave={handleSaveSuccess}
        title="新增考勤记录"
      />

      <AddModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveSuccess}
        title="编辑考勤记录"
        record={currentRecord}
      />

      <DetailModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        record={currentRecord}
      />

      <DeleteModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteSuccess}
        ids={deleteIds}
      />
    </div>
  );
};

export default Attendance;