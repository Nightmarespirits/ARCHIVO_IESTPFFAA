<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="d-flex align-center">
            <v-btn
              variant="text"
              prepend-icon="mdi-arrow-left"
              @click="goBack"
              class="mr-4"
            >
              Volver
            </v-btn>
            <v-icon class="mr-2">mdi-file-plus-outline</v-icon>
            Crear Nuevo Documento
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <v-form ref="form" @submit.prevent="submitForm">
              <v-row>
                <!-- Título del documento -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.title"
                    label="Título del documento *"
                    variant="outlined"
                    :rules="[v => !!v || 'El título es obligatorio']"
                    required
                  ></v-text-field>
                </v-col>
                
                <!-- Tipo de documento -->
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.typeId"
                    :items="documentTypes"
                    item-title="name"
                    item-value="id"
                    label="Tipo de documento *"
                    variant="outlined"
                    :rules="[v => !!v || 'El tipo de documento es obligatorio']"
                    required
                  ></v-select>
                </v-col>
                
                <!-- Descripción del documento -->
                <v-col cols="12">
                  <v-textarea
                    v-model="formData.description"
                    label="Descripción"
                    variant="outlined"
                    rows="3"
                    auto-grow
                  ></v-textarea>
                </v-col>
                
                <!-- Etiquetas -->
                <v-col cols="12">
                  <v-autocomplete
                    v-model="formData.tags"
                    :items="availableTags"
                    item-title="name"
                    item-value="id"
                    label="Etiquetas"
                    variant="outlined"
                    chips
                    multiple
                    closable-chips
                    return-object
                  ></v-autocomplete>
                </v-col>
                
                <!-- Subida de archivo -->
                <v-col cols="12">
                  <v-file-input
                    v-model="formData.file"
                    label="Archivo del documento *"
                    variant="outlined"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.txt"
                    :rules="[v => !!v || 'El archivo es obligatorio']"
                    required
                    show-size
                    prepend-icon="mdi-file-upload-outline"
                    @change="handleFileChange"
                  ></v-file-input>
                  
                  <v-alert
                    v-if="formData.file"
                    type="info"
                    variant="tonal"
                    class="mt-2"
                  >
                    <div class="d-flex align-center">
                      <v-icon class="mr-2">{{ getFileIcon(formData.file) }}</v-icon>
                      <div>
                        <div>{{ formData.file.name }}</div>
                        <div class="text-caption">{{ formatFileSize(formData.file.size) }}</div>
                      </div>
                    </div>
                  </v-alert>
                </v-col>
              </v-row>
              
              <v-divider class="my-4"></v-divider>
              
              <!-- Botones de acción -->
              <div class="d-flex justify-end">
                <v-btn
                  variant="text"
                  @click="resetForm"
                  class="mr-2"
                >
                  Limpiar
                </v-btn>
                <v-btn
                  color="primary"
                  type="submit"
                  :loading="loading"
                  :disabled="loading"
                >
                  Guardar Documento
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Snackbar para notificaciones -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDocumentsStore } from '@/store/documents';
import { useAuthStore } from '@/store/auth';

// Stores y router
const documentsStore = useDocumentsStore();
const authStore = useAuthStore();
const router = useRouter();

// Referencias
const form = ref(null);

// Estado del componente
const documentTypes = ref([]);
const availableTags = ref([]);
const loading = ref(false);
const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000
});

// Datos del formulario
const formData = ref({
  title: '',
  description: '',
  typeId: null,
  tags: [],
  file: null,
  authorId: null
});

// Cargar datos iniciales
onMounted(async () => {
  try {
    loading.value = true;
    
    // Cargar tipos de documentos
    documentTypes.value = await documentsStore.fetchDocumentTypes();
    
    // Cargar etiquetas disponibles
    availableTags.value = await documentsStore.fetchTags();
    
    // Establecer el autor actual
    if (authStore.user && authStore.user.id) {
      formData.value.authorId = authStore.user.id;
    }
    
  } catch (error) {
    showError('Error al cargar los datos iniciales: ' + error.message);
  } finally {
    loading.value = false;
  }
});

// Métodos
async function submitForm() {
  if (!form.value) return;
  
  const { valid } = await form.value.validate();
  
  if (!valid) {
    showError('Por favor, complete todos los campos obligatorios.');
    return;
  }

  if (!formData.value.typeId) {
    showError('El tipo de documento es obligatorio.');
    return;
  }
  
  try {
    loading.value = true;
    
    // Crear FormData para enviar el archivo
    const formDataToSend = new FormData();
    formDataToSend.append('file', formData.value.file);
    formDataToSend.append('title', formData.value.title);
    formDataToSend.append('description', formData.value.description || '');
    formDataToSend.append('authorId', formData.value.authorId);
    formDataToSend.append('typeId', formData.value.typeId);
    
    // Agregar etiquetas si existen
    if (formData.value.tags && formData.value.tags.length > 0) {
      formData.value.tags.forEach((tag, index) => {
        formDataToSend.append(`tags[${index}].id`, tag.id);
        formDataToSend.append(`tags[${index}].name`, tag.name);
      });
    }
    
    // Enviar datos al servidor
    const newDocument = await documentsStore.createDocument(formDataToSend);
    
    showSuccess('Documento creado correctamente.');
    
    // Redirigir a la página de detalles del documento después de añadir metadatos
    if (newDocument.id) {
      try {
        // Crear metadatos básicos
        const metadata = {
          keywords: formData.value.title.split(' ').join(','),
          department: 'General'
        };
        
        await documentsStore.createMetadata(newDocument.id, metadata);
        
        setTimeout(() => {
          router.push(`/documents/${newDocument.id}`);
        }, 1500);
      } catch (metadataError) {
        console.error('Error al crear metadatos:', metadataError);
        // Continuar con la redirección aunque fallen los metadatos
        router.push(`/documents/${newDocument.id}`);
      }
    }
    
  } catch (error) {
    showError('Error al crear el documento: ' + error.message);
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  formData.value = {
    title: '',
    description: '',
    typeId: null,
    tags: [],
    file: null,
    authorId: authStore.user ? authStore.user.id : null
  };
  
  if (form.value) {
    form.value.reset();
  }
}

function handleFileChange(file) {
  // Puedes realizar validaciones adicionales aquí si es necesario
  console.log('Archivo seleccionado:', file);
}

function goBack() {
  router.back();
}

// Utilidades
function getFileIcon(file) {
  if (!file) return 'mdi-file-outline';
  
  const extension = file.name.split('.').pop().toLowerCase();
  
  const iconMap = {
    pdf: 'mdi-file-pdf-box',
    doc: 'mdi-file-word-outline',
    docx: 'mdi-file-word-outline',
    xls: 'mdi-file-excel-outline',
    xlsx: 'mdi-file-excel-outline',
    ppt: 'mdi-file-powerpoint-outline',
    pptx: 'mdi-file-powerpoint-outline',
    jpg: 'mdi-file-image-outline',
    jpeg: 'mdi-file-image-outline',
    png: 'mdi-file-image-outline',
    txt: 'mdi-file-document-outline'
  };
  
  return iconMap[extension] || 'mdi-file-outline';
}

function formatFileSize(size) {
  if (size < 1024) {
    return size + ' bytes';
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB';
  } else {
    return (size / (1024 * 1024)).toFixed(2) + ' MB';
  }
}

function showSuccess(message) {
  snackbar.value = {
    show: true,
    text: message,
    color: 'success',
    timeout: 3000
  };
}

function showError(message) {
  snackbar.value = {
    show: true,
    text: message,
    color: 'error',
    timeout: 5000
  };
}
</script>
