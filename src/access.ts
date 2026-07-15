export default (initialState: any) => {
  const roleId = initialState?.currentUser?.roleId;
  // roleId 后端 Long 类型序列化为字符串
  return {
    // 系统管理员(1) 和 HR专员(2) 可访问HR中控台
    canAdmin: Number(roleId) === 1 || Number(roleId) === 2,
  };
};
