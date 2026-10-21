const fs = require('fs');
const path = require('path');

const norm = (s) => s.replace(/\r\n/g, '\n');

// 1. AddProductWizard.jsx
{
  const filePath = path.resolve('src/components/dashboard/AddProductWizard.jsx');
  let content = norm(fs.readFileSync(filePath, 'utf8'));

  if (!content.includes("import SelectDropdown from '../ui/SelectDropdown';")) {
    content = content.replace(
      "import ImageUpload from '../ui/ImageUpload';",
      "import ImageUpload from '../ui/ImageUpload';\nimport SelectDropdown from '../ui/SelectDropdown';"
    );
  }

  const oldCategorySelect = `            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Category *</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleCategoryChange}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>`;

  const newCategorySelect = `            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Category *</label>
              <SelectDropdown
                value={formData.categoryId}
                onChange={(val) => {
                  const selCat = categories.find(c => String(c.id) === String(val));
                  setFormData(prev => ({
                    ...prev,
                    categoryId: val,
                    categoryName: selCat ? selCat.name : ''
                  }));
                }}
                placeholder="Select Category"
                options={categories.map(cat => ({
                  value: cat.id,
                  label: cat.name
                }))}
              />
            </div>`;

  const oldPetTypeSelect = `            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Target Pet Type</label>
              <select
                name="petType"
                value={formData.petType}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
              >
                <option value="All Pets">All Pets</option>
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Fish">Fish</option>
                <option value="Small Pet">Small Pet</option>
              </select>
            </div>`;

  const newPetTypeSelect = `            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Target Pet Type</label>
              <SelectDropdown
                value={formData.petType}
                onChange={(val) => setFormData(prev => ({ ...prev, petType: val }))}
                options={[
                  { value: 'All Pets', label: 'All Pets', icon: '🐾' },
                  { value: 'Dog', label: 'Dog', icon: '🐕' },
                  { value: 'Cat', label: 'Cat', icon: '🐈' },
                  { value: 'Bird', label: 'Bird', icon: '🦜' },
                  { value: 'Fish', label: 'Fish', icon: '🐠' },
                  { value: 'Small Pet', label: 'Small Pet', icon: '🐹' }
                ]}
              />
            </div>`;

  if (content.includes(oldCategorySelect)) {
    content = content.replace(oldCategorySelect, newCategorySelect);
    console.log('Updated category in AddProductWizard.jsx');
  }
  if (content.includes(oldPetTypeSelect)) {
    content = content.replace(oldPetTypeSelect, newPetTypeSelect);
    console.log('Updated petType in AddProductWizard.jsx');
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

// 2. ProductDetailPage.jsx
{
  const filePath = path.resolve('src/pages/marketplace/ProductDetailPage.jsx');
  let content = norm(fs.readFileSync(filePath, 'utf8'));

  if (!content.includes("import SelectDropdown from '../../components/ui/SelectDropdown';")) {
    content = content.replace(
      "import StarRating from '../../components/marketplace/StarRating';",
      "import StarRating from '../../components/marketplace/StarRating';\nimport SelectDropdown from '../../components/ui/SelectDropdown';"
    );
  }

  const oldRatingSelect = `                          <select 
                            value={newReview.rating} 
                            onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none font-bold text-slate-800 text-xs"
                          >
                            {[5, 4, 3, 2, 1].map(num => (
                              <option key={num} value={num}>
                                {num} {num === 1 ? 'Star' : 'Stars'}
                              </option>
                            ))}
                          </select>`;

  const newRatingSelect = `                          <div className="w-36">
                            <SelectDropdown
                              value={newReview.rating}
                              onChange={(val) => setNewReview({ ...newReview, rating: parseInt(val, 10) })}
                              size="sm"
                              options={[
                                { value: 5, label: '5 Stars', icon: '⭐⭐⭐⭐⭐' },
                                { value: 4, label: '4 Stars', icon: '⭐⭐⭐⭐' },
                                { value: 3, label: '3 Stars', icon: '⭐⭐⭐' },
                                { value: 2, label: '2 Stars', icon: '⭐⭐' },
                                { value: 1, label: '1 Star', icon: '⭐' }
                              ]}
                            />
                          </div>`;

  if (content.includes(oldRatingSelect)) {
    content = content.replace(oldRatingSelect, newRatingSelect);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated rating in ProductDetailPage.jsx');
  }
}
