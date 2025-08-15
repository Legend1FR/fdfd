# دليل إدارة Git للمشروع

## التحقق من الحالة قبل أي عملية
```bash
git status
```

## عملية التحديث الآمنة

### 1. التحقق من التغييرات
```bash
git status                 # عرض الملفات المُعدّلة
git diff                   # مراجعة التغييرات التفصيلية
git diff --name-only       # عرض أسماء الملفات المُعدّلة فقط
```

### 2. إضافة الملفات بانتقائية
```bash
git add filename.js        # إضافة ملف محدد
git add folder/            # إضافة مجلد كامل
git add .                  # إضافة جميع التغييرات (احذر!)
```

### 3. مراجعة الملفات المُضافة
```bash
git diff --cached          # مراجعة الملفات المُضافة قبل commit
```

### 4. إنشاء commit
```bash
git commit -m "وصف واضح للتعديل"
```

### 5. الرفع إلى GitHub
```bash
git push                   # رفع آمن
git push --force           # رفع بالقوة (خطر!)
```

## أوامر مفيدة للمراجعة

### مراجعة تاريخ التحديثات
```bash
git log --oneline -10      # آخر 10 commits
git log --graph --oneline  # عرض بصري للتاريخ
```

### التراجع عن التغييرات
```bash
git checkout -- filename  # التراجع عن تعديل ملف
git reset HEAD filename    # إزالة ملف من staging
git reset --soft HEAD~1    # التراجع عن آخر commit (مع الاحتفاظ بالتغييرات)
git reset --hard HEAD~1    # التراجع عن آخر commit (حذف التغييرات)
```

## نصائح مهمة

1. **استخدم `git status` دائماً قبل أي عملية**
2. **راجع التغييرات بـ `git diff` قبل الـ commit**
3. **اكتب رسائل commit واضحة ومفهومة**
4. **تجنب `git add .` إلا إذا كنت متأكداً**
5. **تجنب `--force` إلا في حالات الضرورة القصوى**
