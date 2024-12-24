<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="姓名" prop="Name">
        <el-input
          v-model="queryParams.Name"
          placeholder="请输入姓名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="性别" prop="Gender">
        <el-input
          v-model="queryParams.Gender"
          placeholder="请输入性别"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="出生日期" prop="DateOfBirth">
        <el-date-picker clearable
          v-model="queryParams.DateOfBirth"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择出生日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="年龄" prop="Age">
        <el-input
          v-model="queryParams.Age"
          placeholder="请输入年龄"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="民族" prop="Ethnicity">
        <el-input
          v-model="queryParams.Ethnicity"
          placeholder="请输入民族"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="身份证号" prop="IDNumber">
        <el-input
          v-model="queryParams.IDNumber"
          placeholder="请输入身份证号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="住址" prop="Address">
        <el-input
          v-model="queryParams.Address"
          placeholder="请输入住址"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号码" prop="PhoneNumber">
        <el-input
          v-model="queryParams.PhoneNumber"
          placeholder="请输入手机号码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="所属公司" prop="Company">
        <el-input
          v-model="queryParams.Company"
          placeholder="请输入所属公司"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="个人共同编号" prop="PersonalUnionAccount">
        <el-input
          v-model="queryParams.PersonalUnionAccount"
          placeholder="请输入个人共同编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="备注" prop="Notes">
        <el-input
          v-model="queryParams.Notes"
          placeholder="请输入备注"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-upload"
          size="mini"
          @click="openImportDialog"
        >上传自excel</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="banfarmList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="id" />
      <el-table-column label="姓名" align="center" prop="name" />
      <el-table-column label="性别" align="center" prop="gender" />
      <el-table-column label="出生日期" align="center" prop="dateOfBirth" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.dateOfBirth, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="年龄" align="center" prop="age" />
      <el-table-column label="民族" align="center" prop="ethnicity" />
      <el-table-column label="身份证号" align="center" prop="idnumber" />
      <el-table-column label="住址" align="center" prop="address" />
      <el-table-column label="手机号码" align="center" prop="phoneNumber" />
      <el-table-column label="工种" align="center" prop="jobStatus" />
      <el-table-column label="失信行为描述" align="center" prop="dishonestBehaviorDescription">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="showDetail(scope.row.dishonestBehaviorDescription)">
            查看
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="所属公司" align="center" prop="company" />
      <el-table-column label="个人共同编号" align="center" prop="personalUnionAccount" />
      <el-table-column label="备注" align="center" prop="notes" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      title="失信行为描述"
      :visible.sync="dialogVisible"
      width="50%"
      :before-close="handleDialogClose"
    >
      <p>{{ currentDescription }}</p>
      <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">关闭</el-button>
  </span>
    </el-dialog>
    <!-- 导入对话框 -->
    <el-dialog
      title="导入数据"
      :visible.sync="importDialogVisible"
      width="500px"
    >
      <el-upload
        class="upload-demo"
        drag
        multiple
        :limit="1"
        :on-exceed="handleExceed"
        :before-upload="beforeUpload"
        :on-success="handleImportSuccess"
        :on-error="handleImportError"
        action="/dev-api/system/banfarm/importData"
        name="file"
        :with-credentials="true"
        :headers="uploadHeaders"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">只支持xlsx、xls格式的Excel文件</div>
      </el-upload>

      <span slot="footer" class="dialog-footer">
        <el-button @click="importDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>


    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改农民工黑名单对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="姓名" prop="Name">
          <el-input v-model="form.Name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="Gender">
          <el-input v-model="form.Gender" placeholder="请输入性别" />
        </el-form-item>
        <el-form-item label="出生日期" prop="DateOfBirth">
          <el-date-picker clearable
            v-model="form.DateOfBirth"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择出生日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="年龄" prop="Age">
          <el-input v-model="form.Age" placeholder="请输入年龄" />
        </el-form-item>
        <el-form-item label="民族" prop="Ethnicity">
          <el-input v-model="form.Ethnicity" placeholder="请输入民族" />
        </el-form-item>
        <el-form-item label="身份证号" prop="IDNumber">
          <el-input v-model="form.IDNumber" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item label="住址" prop="Address">
          <el-input v-model="form.Address" placeholder="请输入住址" />
        </el-form-item>
        <el-form-item label="手机号码" prop="PhoneNumber">
          <el-input v-model="form.PhoneNumber" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="工种" prop="JobStatus">
          <el-input v-model="form.JobStatus" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="失信行为描述" prop="DishonestBehaviorDescription">
          <el-input v-model="form.DishonestBehaviorDescription" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="所属公司" prop="Company">
          <el-input v-model="form.Company" placeholder="请输入所属公司" />
        </el-form-item>
        <el-form-item label="个人共同编号" prop="PersonalUnionAccount">
          <el-input v-model="form.PersonalUnionAccount" placeholder="请输入个人共同编号" />
        </el-form-item>
        <el-form-item label="备注" prop="Notes">
          <el-input v-model="form.Notes" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listBanfarm, getBanfarm, delBanfarm, addBanfarm, updateBanfarm } from "@/api/system/banfarm";
import Cookies from 'js-cookie';


export default {
  name: "Banfarm",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 农民工黑名单表格数据
      banfarmList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,

      importDialogVisible: false,
      uploadHeaders: {
        // 例如如果需要token认证，可在此添加Authorization头
        // "Authorization": "Bearer " + getToken() // 假设有个getToken函数
        Authorization: "Bearer " + Cookies.get('Admin-Token')
      },

      dialogVisible: false, // 对话框是否显示
      currentDescription: "", // 当前选中的失信行为描述

      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        Name: null,
        Gender: null,
        DateOfBirth: null,
        Age: null,
        Ethnicity: null,
        IDNumber: null,
        Address: null,
        PhoneNumber: null,
        JobStatus: null,
        DishonestBehaviorDescription: null,
        Company: null,
        PersonalUnionAccount: null,
        Notes: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询农民工黑名单列表 */
    getList() {
      this.loading = true;
      listBanfarm(this.queryParams).then(response => {
        console.log(JSON.stringify(response, null, 2));
        this.banfarmList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 显示对话框并设置内容
    showDetail(description) {
      this.currentDescription = description;
      this.dialogVisible = true;
    },
    // 关闭对话框时清空内容
    handleDialogClose() {
      this.currentDescription = "";
      this.dialogVisible = false;
    },
    openImportDialog() {
      this.importDialogVisible = true;
    },
    beforeUpload(file) {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel';
      if (!isExcel) {
        this.$message.error('只支持Excel文件上传!');
      }
      return isExcel;
    },
    handleExceed(files, fileList) {
      this.$message.warning(`只能上传1个文件，请删除多余文件`);
    },
    handleImportSuccess(response, file, fileList) {
      if (response.code === 200) {
        this.$message.success('导入成功');
        this.importDialogVisible = false;
        this.getList(); // 导入成功后刷新列表
      } else {
        this.$message.error(response.msg || '导入失败');
      }
    },
    handleImportError(err, file, fileList) {
      this.$message.error('导入失败，请检查文件格式或服务器异常');
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        Name: null,
        Gender: null,
        DateOfBirth: null,
        Age: null,
        Ethnicity: null,
        IDNumber: null,
        Address: null,
        PhoneNumber: null,
        JobStatus: null,
        DishonestBehaviorDescription: null,
        Company: null,
        PersonalUnionAccount: null,
        Notes: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加农民工黑名单";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getBanfarm(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改农民工黑名单";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateBanfarm(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addBanfarm(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除农民工黑名单编号为"' + ids + '"的数据项？').then(function() {
        return delBanfarm(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/banfarm/export', {
        ...this.queryParams
      }, `banfarm_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
