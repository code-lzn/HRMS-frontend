import { cancelDelegate, createDelegate, getMyDelegates } from '@/api/approvalController';
import request from '@/libs/request';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, DatePicker, Form, Input, Select, Tag, Avatar, message, Modal } from 'antd';
import { UserOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

const ApprovalDelegate: React.FC = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [delegates, setDelegates] = useState<any[]>([]);
  const [myDelegates, setMyDelegates] = useState<any[]>([]); // 别人委托我
  const [empOptions, setEmpOptions] = useState<{ label: string; value: number }[]>([]);
  const [empLoading, setEmpLoading] = useState(false);

  const fetchDelegates = async () => {
    try {
      const res = await getMyDelegates();
      setDelegates(res?.data?.asDelegator || []);
      setMyDelegates(res?.data?.asDelegate || []);
    } catch (e: any) {
      message.error(e?.message || '加载失败');
    }
  };

  useEffect(() => {
    fetchDelegates();
  }, []);

  const searchEmp = async (kw: string) => {
    if (!kw) {
      setEmpOptions([]);
      return;
    }
    setEmpLoading(true);
    try {
      const res = await request('/api/employees/search', { params: { keyword: kw } });
      setEmpOptions(
        (res?.data || []).map((e: any) => ({
          label: `${e.name} (${e.positionName || ''})`,
          value: e.id,
        })),
      );
    } catch {
      setEmpOptions([]);
    } finally {
      setEmpLoading(false);
    }
  };

  const handleCreate = async (values: any) => {
    setSubmitting(true);
    try {
      await createDelegate({
        delegateId: values.delegateId,
        startTime: values.startDate.format('YYYY-MM-DDTHH:mm:ss'),
        endTime: values.endDate.format('YYYY-MM-DDTHH:mm:ss'),
      });
      message.success('委托设置成功');
      form.resetFields();
      fetchDelegates();
    } catch (e: any) {
      message.error(e?.message || '设置失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (id: number) => {
    Modal.confirm({
      title: '确认取消委托',
      content: '取消后该委托将立即失效，确定要取消吗？',
      onOk: async () => {
        try {
          await cancelDelegate(id);
          message.success('已取消委托');
          fetchDelegates();
        } catch (e: any) {
          message.error(e?.message || '取消失败');
        }
      },
    });
  };

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const getStatus = (r: any) => {
    if (r.enabled === 0) return { t: '已取消', c: 'default' as const };
    return dayjs().isAfter(dayjs(r.endTime)) ? { t: '已过期', c: 'default' as const } : { t: '生效中', c: 'green' as const };
  };

  const currentDelegate = delegates.find((d) => getStatus(d).t === '生效中');

  return (
    <PageContainer
      header={{
        title: (
          <div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>委托审批设置</div>
            <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>管理您的审批委托授权</div>
          </div>
        ),
      }}
      extra={[
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: '#3b82f6', borderColor: '#3b82f6', borderRadius: 8, padding: '6px 16px' }}
          onClick={() => form.submit()}
          loading={submitting}
        >
          新增委托
        </Button>,
      ]}
    >
      <Card
        style={{ borderRadius: 12, border: 'none', boxShadow: 'none', background: '#eff6ff', marginBottom: 24 }}
        title={
          <div style={{ fontSize: 16, fontWeight: 600, color: '#2563eb' }}>委托审批规则说明</div>
        }
      >
        <ul style={{ fontSize: 14, color: '#4b5563', paddingLeft: 20, listStyle: 'none' }}>
          <li style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#3b82f6' }} />
            委托期间产生的审批任务将自动转交给被委托人处理
          </li>
          <li style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#3b82f6' }} />
            被委托人审批时，系统将记录"XXX 代 YYY 审批"
          </li>
          <li style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#3b82f6' }} />
            委托人可随时取消委托，取消后新任务不再转交
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#3b82f6' }} />
            同一时间只能有一个有效委托
          </li>
        </ul>
      </Card>

      <Card
        style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: 24 }}
        title={
          <div style={{ fontSize: 16, fontWeight: 600 }}>新增委托</div>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            <Form.Item
              name="delegateId"
              label="被委托人"
              rules={[{ required: true, message: '请选择被委托人' }]}
            >
              <Select
                showSearch
                placeholder="请选择被委托人"
                filterOption={false}
                onSearch={searchEmp}
                options={empOptions}
                loading={empLoading}
                style={{ width: '100%', borderRadius: 8, height: 40 }}
              />
            </Form.Item>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <Form.Item
                  name="startDate"
                  label="开始日期"
                  rules={[{ required: true, message: '请选择开始日期' }]}
                >
                  <DatePicker
                    style={{ width: '100%', borderRadius: 8, height: 40 }}
                    placeholder="年/月/日"
                    disabledDate={(d) => d && d < dayjs().startOf('day')}
                  />
                </Form.Item>
              </div>
              <div style={{ flex: 1 }}>
                <Form.Item
                  name="endDate"
                  label="结束日期"
                  rules={[{ required: true, message: '请选择结束日期' }]}
                >
                  <DatePicker
                    style={{ width: '100%', borderRadius: 8, height: 40 }}
                    placeholder="年/月/日"
                    disabledDate={(d) => d && d < dayjs().startOf('day')}
                  />
                </Form.Item>
              </div>
            </div>
          </div>
          <Form.Item name="reason" label="委托原因（选填）">
            <Input.TextArea rows={3} placeholder="请输入委托原因（选填）" style={{ borderRadius: 8 }} />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
            <Button style={{ borderRadius: 8, padding: '6px 16px' }} onClick={() => form.resetFields()}>
              取消
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{ background: '#3b82f6', borderColor: '#3b82f6', borderRadius: 8, padding: '6px 20px' }}
            >
              确认添加
            </Button>
          </div>
        </Form>
      </Card>

      {(currentDelegate || myDelegates.filter((d: any) => getStatus(d).t === '生效中').length > 0) && (
        <Card
          style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e' }} />
              <span style={{ fontSize: 16, fontWeight: 600 }}>当前有效委托</span>
              <span style={{ fontSize: 13, color: '#999' }}>
                {(currentDelegate ? 1 : 0) + myDelegates.filter((d: any) => getStatus(d).t === '生效中').length}条
              </span>
            </div>
          </div>
          {/* 我委托别人 */}
          {currentDelegate && (
            <div style={{ padding: 16, background: '#f9fafb', borderRadius: 8, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Avatar size={52} icon={<UserOutlined />} style={{ backgroundColor: '#6366f1', fontSize: 22 }}>
                    {getInitial(currentDelegate.delegateName)}
                  </Avatar>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 600 }}>{currentDelegate.delegateName}</span>
                      {currentDelegate.delegatePosition && (
                        <span style={{ fontSize: 13, color: '#999' }}>{currentDelegate.delegatePosition}</span>
                      )}
                      <Tag color="blue" style={{ fontSize: 12, borderRadius: 4 }}>我委托</Tag>
                      <Tag color="green" style={{ fontSize: 12, background: '#dcfce7', color: '#16a34a', borderRadius: 4 }}>生效中</Tag>
                    </div>
                    <div style={{ marginTop: 6, fontSize: 13, color: '#666' }}>
                      <span>{dayjs(currentDelegate.startTime).format('YYYY-MM-DD')}</span>
                      <span style={{ margin: '0 8px' }}>至</span>
                      <span>{dayjs(currentDelegate.endTime).format('YYYY-MM-DD')}</span>
                      {currentDelegate.reason && (
                        <span style={{ marginLeft: 12, color: '#dc2626' }}>- {currentDelegate.reason}</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button danger type="text" onClick={() => handleCancel(currentDelegate.id)}
                  style={{ color: '#dc2626', padding: '4px 8px', flexShrink: 0 }}>
                  取消委托
                </Button>
              </div>
            </div>
          )}
          {/* 别人委托我 */}
          {myDelegates.filter((d: any) => getStatus(d).t === '生效中').map((d: any) => (
            <div key={d.id} style={{ padding: 16, background: '#f9fafb', borderRadius: 8, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Avatar size={52} icon={<UserOutlined />} style={{ backgroundColor: '#8b5cf6', fontSize: 22 }}>
                  {getInitial(d.delegatorName)}
                </Avatar>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 600 }}>{d.delegatorName || '委托人'}</span>
                    <Tag color="purple" style={{ fontSize: 12, borderRadius: 4 }}>委托我</Tag>
                    <Tag color="green" style={{ fontSize: 12, background: '#dcfce7', color: '#16a34a', borderRadius: 4 }}>生效中</Tag>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 13, color: '#666' }}>
                    <span>{dayjs(d.startTime).format('YYYY-MM-DD')}</span>
                    <span style={{ margin: '0 8px' }}>至</span>
                    <span>{dayjs(d.endTime).format('YYYY-MM-DD')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}
    </PageContainer>
  );
};

export default ApprovalDelegate;
