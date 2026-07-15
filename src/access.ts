export default (initialState: any) => {
  const roleId = initialState?.currentUser?.roleId;
  return {
    // 系统管理员(1) 和 HR专员(2) 可访问HR中控台
    canAdmin: roleId === 1 || roleId === 2,
  };
};
