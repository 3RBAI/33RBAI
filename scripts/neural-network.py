import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

class ThreeRBNeuralNetwork:
    """
    شبكة عصبية متقدمة لنظام 3RB AI
    تدعم معالجة البيانات المتعددة والتعلم العميق
    """
    
    def __init__(self, input_shape=10, hidden_layers=[64, 32], output_units=1):
        """
        إنشاء الشبكة العصبية
        
        Args:
            input_shape: حجم المدخلات
            hidden_layers: قائمة بأحجام الطبقات المخفية
            output_units: عدد وحدات الإخراج
        """
        self.input_shape = input_shape
        self.hidden_layers = hidden_layers
        self.output_units = output_units
        self.model = None
        self.scaler = StandardScaler()
        
        print("🧠 إنشاء شبكة عصبية متقدمة لـ 3RB AI")
        print(f"📊 المدخلات: {input_shape}")
        print(f"🔗 الطبقات المخفية: {hidden_layers}")
        print(f"📤 المخرجات: {output_units}")
    
    def build_model(self):
        """بناء نموذج الشبكة العصبية"""
        
        self.model = tf.keras.Sequential([
            # طبقة الإدخال
            tf.keras.layers.Dense(
                self.hidden_layers[0], 
                activation='relu', 
                input_shape=(self.input_shape,),
                name='input_layer'
            ),
            tf.keras.layers.Dropout(0.2),  # منع الإفراط في التعلم
            
            # الطبقات المخفية
            *[tf.keras.layers.Dense(
                units, 
                activation='relu',
                name=f'hidden_layer_{i+1}'
            ) for i, units in enumerate(self.hidden_layers[1:])],
            
            # طبقة الإخراج
            tf.keras.layers.Dense(
                self.output_units, 
                activation='sigmoid' if self.output_units == 1 else 'softmax',
                name='output_layer'
            )
        ])
        
        # تجميع النموذج
        self.model.compile(
            optimizer='adam',
            loss='binary_crossentropy' if self.output_units == 1 else 'categorical_crossentropy',
            metrics=['accuracy']
        )
        
        print("✅ تم بناء الشبكة العصبية بنجاح")
        return self.model
    
    def generate_sample_data(self, samples=1000):
        """توليد بيانات تجريبية للتدريب"""
        
        print(f"📊 توليد {samples} عينة تجريبية...")
        
        # توليد بيانات عشوائية
        X = np.random.randn(samples, self.input_shape)
        
        # توليد تصنيفات بناءً على قاعدة بسيطة
        y = (X.sum(axis=1) > 0).astype(int)
        
        return X, y
    
    def train_model(self, X=None, y=None, epochs=50, validation_split=0.2):
        """تدريب النموذج"""
        
        if X is None or y is None:
            X, y = self.generate_sample_data()
        
        # تطبيع البيانات
        X_scaled = self.scaler.fit_transform(X)
        
        # تقسيم البيانات
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42
        )
        
        print("🚀 بدء تدريب الشبكة العصبية...")
        
        # تدريب النموذج
        history = self.model.fit(
            X_train, y_train,
            epochs=epochs,
            validation_split=validation_split,
            batch_size=32,
            verbose=1
        )
        
        # تقييم النموذج
        test_loss, test_accuracy = self.model.evaluate(X_test, y_test, verbose=0)
        
        print(f"📈 دقة النموذج على بيانات الاختبار: {test_accuracy:.4f}")
        print(f"📉 خسارة النموذج على بيانات الاختبار: {test_loss:.4f}")
        
        return history, test_accuracy
    
    def predict(self, X):
        """التنبؤ باستخدام النموذج"""
        
        if self.model is None:
            raise ValueError("يجب تدريب النموذج أولاً")
        
        X_scaled = self.scaler.transform(X)
        predictions = self.model.predict(X_scaled)
        
        return predictions
    
    def visualize_architecture(self):
        """عرض هيكل الشبكة العصبية"""
        
        if self.model is None:
            raise ValueError("يجب بناء النموذج أولاً")
        
        print("\n🏗️ هيكل الشبكة العصبية:")
        print("=" * 50)
        self.model.summary()
        
        # عرض معلومات الطبقات
        print("\n📋 تفاصيل الطبقات:")
        for i, layer in enumerate(self.model.layers):
            print(f"الطبقة {i+1}: {layer.name}")
            print(f"  - النوع: {type(layer).__name__}")
            print(f"  - الشكل: {layer.output_shape}")
            if hasattr(layer, 'activation'):
                print(f"  - التفعيل: {layer.activation.__name__}")
            print()

def demonstrate_3rb_neural_network():
    """عرض توضيحي للشبكة العصبية"""
    
    print("🎯 عرض توضيحي: شبكة عصبية متقدمة لـ 3RB AI")
    print("=" * 60)
    
    # إنشاء الشبكة العصبية
    nn = ThreeRBNeuralNetwork(
        input_shape=10,
        hidden_layers=[64, 32, 16],
        output_units=1
    )
    
    # بناء النموذج
    model = nn.build_model()
    
    # عرض هيكل الشبكة
    nn.visualize_architecture()
    
    # تدريب النموذج
    history, accuracy = nn.train_model(epochs=30)
    
    # اختبار التنبؤ
    print("\n🔮 اختبار التنبؤ:")
    test_data = np.random.randn(5, 10)
    predictions = nn.predict(test_data)
    
    for i, pred in enumerate(predictions):
        print(f"العينة {i+1}: احتمالية = {pred[0]:.4f}")
    
    print("\n✅ تم الانتهاء من العرض التوضيحي بنجاح!")
    
    return nn, history, accuracy

# تشغيل العرض التوضيحي
if __name__ == "__main__":
    neural_network, training_history, final_accuracy = demonstrate_3rb_neural_network()
    
    print(f"\n🎉 النتيجة النهائية: دقة {final_accuracy:.2%}")
    print("🧠 الشبكة العصبية جاهزة للاستخدام في نظام 3RB AI!")
